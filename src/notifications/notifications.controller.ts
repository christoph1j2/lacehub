import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post()
    async create(
        @Body() body: { type: string; message: string; matchId?: number },
        @Req() req: any,
    ) {
        const userId = req.user.id;
        return await this.notificationsService.create(
            userId,
            body.type,
            body.message,
            body.matchId,
        );
    }

    @Get()
    async findAll(@Req() req: any) {
        const userId = req.user.id;
        return await this.notificationsService.findAll(userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: number) {
        return await this.notificationsService.markAsRead(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        return await this.notificationsService.delete(id);
    }
}
