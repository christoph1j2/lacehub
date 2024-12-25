import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../entities/match.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { User } from '../entities/user.entity';
import { Wtb } from '../entities/wtb.entity';
import { Wts } from '../entities/wts.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '../entities/notification.entity';
import { MailService } from '../mail/mail.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match, User, Wtb, Wts, Notification]),
        NotificationsModule,
    ],
    controllers: [MatchesController],
    providers: [MatchesService, NotificationsService, MailService],
})
export class MatchesModule {}
