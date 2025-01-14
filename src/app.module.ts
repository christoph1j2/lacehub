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
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard/jwt-auth.guard';
import { ReviewsModule } from './reviews/reviews.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as os from 'os';
import { BannedUserGuard } from './common/guards/banned-user.guard';

const localIP = getLocalIP();
const isServerIP = localIP === '172.20.0.8';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: isServerIP ? './development.env' : './local.env',
        }),
        CacheModule.register({
            isGlobal: true,
            store: 'RedisStore',
            host: isServerIP ? 'cache' : 'localhost',
            port: 6379,
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
        ReviewsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_GUARD,
            useClass: BannedUserGuard,
        },
        MailService,
    ],
})
export class AppModule {}

function getLocalIP(): string | null {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        if (iface) {
            for (const alias of iface) {
                if (alias.family === 'IPv4' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
    return null;
}
