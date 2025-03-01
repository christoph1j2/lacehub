import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiOperation } from '@nestjs/swagger';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly health: HealthCheckService,
        private readonly http: HttpHealthIndicator,
        private readonly disk: DiskHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        @InjectDataSource() private dataSource: DataSource,
    ) {}

    @Public()
    @Get()
    @ApiOperation({
        description: 'Welcome endpoint',
    })
    async getWelcome(): Promise<{
        message: string;
        version: string;
        status: string;
    }> {
        return await this.appService.getWelcome();
    }

    @Public()
    @Get('health')
    @HealthCheck()
    async check() {
        return this.health.check([
            async () =>
                this.http.pingCheck('lacehub-frontend', 'https://lacehub.cz/'),
            () => this.db.pingCheck('database'),
            async () =>
                this.disk.checkStorage('storage', {
                    path: 'X:/',
                    thresholdPercent: 0.5,
                }),
        ]);
    }
}
