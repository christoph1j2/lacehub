import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { MailService } from '../mail/mail.service';

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
}
