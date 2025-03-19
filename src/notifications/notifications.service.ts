/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { MailService } from '../mail/mail.service';
import { Match } from '../entities/match.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,
        @InjectRepository(User)
        private userRepository: Repository<User>,

        private readonly mailService: MailService,
    ) {}

    async create(
        userId: number,
        type: string,
        message: string,
        matchId?: number,
    ): Promise<Notification> {
        // First, check if the user exists
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create notification
        const notification = this.notificationsRepository.create({
            user: { id: userId },
            type,
            message,
            is_read: false,
            created_at: new Date(),
            match: matchId ? { id: matchId } : null,
        });

        // Send email if user has an email
        if (user.email) {
            try {
                await this.mailService.sendEmail(
                    user.email,
                    `${type} notification`,
                    message,
                );
            } catch (error) {
                console.error('Failed to send email:', error);
                // Optionally, you might want to handle email send failures differently
            }
        }

        // Save and return the notification
        return await this.notificationsRepository.save(notification);
    }

    async findAll(userId: number): Promise<Notification[]> {
        return await this.notificationsRepository.find({
            where: { user: { id: userId } },
            order: { created_at: 'DESC' },
        });
    }

    async markAsRead(id: number, userId: number): Promise<Notification> {
        const notification = await this.notificationsRepository.findOne({
            where: { id, user: { id: userId } },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.is_read = true;
        return await this.notificationsRepository.save(notification);
    }

    async delete(id: number, userId: number): Promise<void> {
        const notification = await this.notificationsRepository.findOne({
            where: { id, user: { id: userId } },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        await this.notificationsRepository.delete(id);
    }

    /**
     * Creates a batch notification for multiple matches
     * @param userId - The user receiving the notification
     * @param type - Notification type
     * @param matches - Array of match objects
     * @param userRole - 'buyer' or 'seller' to determine context
     */
    async createMatchBatchNotification(
        userId: number,
        type: string,
        matches: Match[],
        userRole: 'buyer' | 'seller',
    ): Promise<Notification> {
        // Check if user exists
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Group matches by the other party (buyer or seller)
        const groupedMatches = this.groupMatchesByCounterparty(
            matches,
            userRole,
        );

        // Create a single database notification (shown in app)
        const message = `You have matches with ${Object.keys(groupedMatches).length} ${userRole === 'buyer' ? 'sellers' : 'buyers'}!`;
        const notification = this.notificationsRepository.create({
            user: { id: userId },
            type,
            message,
            is_read: false,
            created_at: new Date(),
            // Link to first match for database integrity
            match: matches.length > 0 ? { id: matches[0].id } : null,
        });

        // Save notification to database
        const savedNotification =
            await this.notificationsRepository.save(notification);

        // Send email with all matches if user has email
        if (user.email) {
            try {
                await this.sendMatchBatchEmail(
                    user.email,
                    groupedMatches,
                    userRole,
                );
            } catch (error) {
                console.error('Failed to send batch match email:', error);
            }
        }

        return savedNotification;
    }

    /**
     * Groups matches by counterparty (buyer or seller)
     */
    private groupMatchesByCounterparty(
        matches: Match[],
        userRole: 'buyer' | 'seller',
    ): Record<string, any[]> {
        const result = {};

        matches.forEach((match) => {
            // Determine the counterparty based on user role
            const counterpartyId =
                userRole === 'buyer' ? match.seller.id : match.buyer.id;
            const counterparty =
                userRole === 'buyer' ? match.seller : match.buyer;

            if (!result[counterpartyId]) {
                result[counterpartyId] = {
                    user: counterparty,
                    items: [],
                };
            }

            // Add the matched item
            result[counterpartyId].items.push({
                match: match,
                product:
                    userRole === 'buyer'
                        ? match.wts.product
                        : match.wtb.product,
                size: userRole === 'buyer' ? match.wts.size : match.wtb.size,
            });
        });

        return result;
    }

    /**
     * Sends a consolidated email with all matches
     */
    private async sendMatchBatchEmail(
        email: string,
        groupedMatches: Record<string, any>,
        userRole: 'buyer' | 'seller',
    ): Promise<void> {
        const subject = `Match notification: You have matches with ${Object.keys(groupedMatches).length} ${userRole === 'buyer' ? 'sellers' : 'buyers'}`;

        // Build HTML email body
        let htmlContent = `
            <h2>Match Notification</h2>
            <p>You have matches with the following ${userRole === 'buyer' ? 'sellers' : 'buyers'}:</p>
        `;

        // For each counterparty
        for (const [id, data] of Object.entries(groupedMatches)) {
            const counterparty = data.user;
            htmlContent += `
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <h3>${counterparty.username} (${counterparty.email})</h3>
                    <p>Credibility score: ${counterparty.credibility_score || 'N/A'}</p>
                    <p>Matched items:</p>
                    <ul>
            `;

            // List all matched items for this counterparty
            data.items.forEach((item) => {
                htmlContent += `
                    <li>${item.product.name || item.product.sku} - Size: ${item.size}</li>
                `;
            });

            // Add contact button
            htmlContent += `
                    </ul>
                    <p>
                        <a href="mailto:${counterparty.email}" 
                           style="display: inline-block; padding: 8px 16px; background-color: #4CAF50; color: white; 
                                  text-decoration: none; border-radius: 4px;">
                            Contact ${counterparty.username}
                        </a>
                    </p>
                </div>
            `;
        }

        // Send the email
        await this.mailService.sendEmail(email, subject, htmlContent);
    }
}
