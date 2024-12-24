import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { User } from '../entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { MailService } from 'src/mail/mail.service';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, User]), MailModule],
    controllers: [NotificationsController],
    providers: [NotificationsService, MailService],
})
export class NotificationsModule {}
