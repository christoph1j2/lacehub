import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { APP_GUARD, APP_PIPE, DiscoveryModule } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard/jwt-auth.guard';
import { ReviewsModule } from './reviews/reviews.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as os from 'os';
import { XssMiddleware } from './common/middleware/xss.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

const localIP = getLocalIP();
//const isServerIP = localIP === '172.20.0.9';
const isServerIP = /^172\.20\.0\.[0-9]$/.test(localIP);

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
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'default',
                    ttl: 60000, // 60 seconds
                    limit: 60, // 60 requests per minute (1 req/sec average)
                },
                {
                    name: 'auth',
                    ttl: 60000,
                    limit: 60,
                },
                {
                    name: 'match',
                    ttl: 60000,
                    limit: 60,
                },
            ],
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
        DiscoveryModule,
        TerminusModule,
        HttpModule,
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
            useClass: ThrottlerGuard,
        },
        MailService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(XssMiddleware).forRoutes('*');
    }
}

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
