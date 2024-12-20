import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/entities/match.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { User } from 'src/entities/user.entity';
import { Wtb } from 'src/entities/wtb.entity';
import { Wts } from 'src/entities/wts.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Notification } from 'src/entities/notification.entity';
import { MailService } from 'src/mail/mail.service';

@Module({
    imports: [TypeOrmModule.forFeature([Match, User, Wtb, Wts, Notification])],
    controllers: [MatchesController],
    providers: [MatchesService, NotificationsService, MailService],
})
export class MatchesModule {}
