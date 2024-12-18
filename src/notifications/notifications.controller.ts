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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post()
    @ApiOperation({
        summary:
            'Create a new notification for a user, should be created on its own',
    })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
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
    @ApiOperation({
        summary: 'Get all notifications for a user, displayed in notif tab',
    })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@Req() req: any) {
        const userId = req.user.id;
        return await this.notificationsService.findAll(userId);
    }

    @Patch(':id/read')
    @ApiOperation({
        summary:
            'Mark a notification as read - when user sees the notification, mark as read',
    })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async markAsRead(@Param('id') id: number, @Req() req: any) {
        const userId = req.user.id;
        return await this.notificationsService.markAsRead(id, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification, done through notif tab' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async delete(@Param('id') id: number, @Req() req: any) {
        const userId = req.user.id;
        return await this.notificationsService.delete(id, userId);
    }
}
