import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { WtbModule } from './wtb/wtb.module';
import { WtsModule } from './wts/wts.module';
import { MatchesModule } from './matches/matches.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { UserInventoryModule } from './user-inventory/user-inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'development.env'
    }),
    DatabaseModule,
    UsersModule,
    ProductsModule,
    WtbModule,
    WtsModule,
    MatchesModule,
    NotificationsModule,
    ReportsModule,
    UserInventoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
