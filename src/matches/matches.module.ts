import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../entities/match.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Wts } from '../entities/wts.entity';
import { Wtb } from '../entities/wtb.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Match,
            Wtb,
            Wts,
            User,
            Product,
            Notification,
        ]),
        NotificationsModule,
    ],
    controllers: [MatchesController],
    providers: [MatchesService, NotificationsService, MailService],
})
export class MatchesModule {}
