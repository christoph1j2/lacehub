import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    async getWelcome(): Promise<{
        message: string;
        version: string;
        status: string;
    }> {
        return await {
            message: 'Welcome to the LaceHub API',
            version: '1.0-beta',
            status: 'OK',
        };
    }

    /*     async getHealth(): Promise<{
        status: string;
        timestamp: string;
    }> {
        return await {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    } */
}
