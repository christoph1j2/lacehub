import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { WtbModule } from './wtb/wtb.module';
import { WtsModule } from './wts/wts.module';
import { MatchesModule } from './matches/matches.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { UserInventoryModule } from './user-inventory/user-inventory.module';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './development.env',
        }),
        DatabaseModule,
        UsersModule,
        ProductsModule,
        WtbModule,
        WtsModule,
        MatchesModule,
        NotificationsModule,
        ReportsModule,
        UserInventoryModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        MailService,
    ],
})
export class AppModule {}
