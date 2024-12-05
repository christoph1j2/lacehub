import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from '../entities/report.entity';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    // user reporting
    @Post(':reportedUserId')
    async create(
        @Body('reportText') reportText: string,
        @Param('reportedUserId') reportedUserId: number,
        @Req() req,
    ): Promise<void> {
        if (!reportText) {
            throw new Error('Report text is required');
        }

        const reporterUserId = req.user.id;
        await this.reportsService.create(
            reportText,
            reporterUserId,
            reportedUserId,
        );
    }

    // list all reports filed by specific user
    @Get('user')
    async findByReporterUserId(
        @Query('userId') userId: number,
    ): Promise<Report[]> {
        return await this.reportsService.findByReporterUserId(userId);
    }

    // list all reports for admin ui
    @Roles('admin')
    @Get()
    async findAll(): Promise<Report[]> {
        return await this.reportsService.findAll();
    }

    // get specific report by id for admin ui
    @Roles('admin')
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Report> {
        return await this.reportsService.findOne(id);
    }

    // mark report as resolved (admin)
    // TODO: refine
    @Roles('admin')
    @Put(':id/resolve')
    async resolve(
        @Param('id') id: number,
        @Body('actionTaken') actionTaken: string,
    ): Promise<Report> {
        return await this.reportsService.resolveReport(id, actionTaken);
    }
}
