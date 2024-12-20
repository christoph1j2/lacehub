import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as os from 'os';

const localIP = getLocalIP();
const isServerIP = localIP === '93.99.25.8';

console.log('localIP', localIP);
console.log('isServerIP', isServerIP);

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: isServerIP ? './development.env' : './local.env',
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
