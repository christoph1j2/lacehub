import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiOperation } from '@nestjs/swagger';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly health: HealthCheckService,
        private readonly http: HttpHealthIndicator,
        private readonly disk: DiskHealthIndicator,
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
    check() {
        return this.health.check([
            async () =>
                this.http.pingCheck('lacehub-frontend', 'https://lacehub.cz/'),
            async () =>
                this.http.pingCheck(
                    'database-server',
                    'https://databaze.lacehub.cz',
                ),
            async () =>
                this.disk.checkStorage('storage', {
                    path: '/',
                    thresholdPercent: 0.5,
                }),
        ]);
    }
}
