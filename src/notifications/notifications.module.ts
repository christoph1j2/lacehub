import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { User } from 'src/entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, User])],
    controllers: [NotificationsController],
    providers: [NotificationsService, MailService],
})
export class NotificationsModule {}
