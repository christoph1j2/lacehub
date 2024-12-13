import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,
    ) {}

    async create(
        userId: number,
        type: string,
        message: string,
        matchId?: number,
    ): Promise<Notification> {
        const notification = this.notificationsRepository.create({
            user: { id: userId },
            type,
            message,
            is_read: false,
            created_at: new Date(),
            match: matchId ? { id: matchId } : null,
        });
        return await this.notificationsRepository.save(notification);
    }

    async findAll(userId: number): Promise<Notification[]> {
        return await this.notificationsRepository.find({
            where: { user: { id: userId } },
            order: { created_at: 'DESC' },
        });
    }

    async markAsRead(id: number): Promise<Notification> {
        const notification = await this.notificationsRepository.findOneBy({
            id,
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.is_read = true;
        return await this.notificationsRepository.save(notification);
    }

    async delete(id: number): Promise<void> {
        const result = await this.notificationsRepository.delete(id);
        if (result.affected === 0) throw new Error('Notification not found');
    }
}
