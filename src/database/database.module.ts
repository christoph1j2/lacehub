import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: './local.env', //!change
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('HOST'),
                port: +configService.get<number>('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: `${configService.get('DB_PASSWORD')}`,
                database: configService.get('DATABASE'),
                //autoLoadEntities: true,
                entities: [__dirname + '/../**/*.entity.{js,ts}'],
                //synchronize: true, //!! Do not use this in production, set to 'false'
                logging: true,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
