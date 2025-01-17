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
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { FileReportDto } from './dto/file-report.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    // user reporting
    @Post(':reportedUserId')
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Report user, required report text, reportedUserId as parameter',
    })
    @ApiResponse({ status: 201, description: 'Report created successfully' })
    @ApiResponse({ status: 400, description: 'Report text is required' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(
        @Body() fileReportDto: FileReportDto,
        @Param('reportedUserId') reportedUserId: number,
        @Req() req,
    ): Promise<void> {
        const { reportText } = fileReportDto;

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

    // list all reports filed by specific user for admin ui
    @Roles('admin')
    @Get('user')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get reports filed by specific user, only for admin',
    })
    @ApiResponse({ status: 200, description: 'Reports found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Reports not found' })
    async findByReporterUserId(
        @Query('userId') userId: number,
    ): Promise<Report[]> {
        return await this.reportsService.findByReporterUserId(userId);
    }

    // list all reports filed by specific user for user ui
    @Get('user')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get reports filed by specific user for specific user',
    })
    @ApiResponse({ status: 200, description: 'Reports found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Reports not found' })
    async findByReporterUserIdForUser(@Req() req): Promise<Report[]> {
        return await this.reportsService.findByReporterUserId(req.user.id);
    }

    // list all reports for admin ui
    @Roles('admin')
    @Get()
    @ApiOperation({ summary: 'Get all reports for admin ui' })
    @ApiResponse({ status: 200, description: 'Reports found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Reports not found' })
    @ApiBearerAuth()
    async findAll(): Promise<Report[]> {
        return await this.reportsService.findAll();
    }

    // get specific report by id for admin ui
    @Roles('admin')
    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get specific report by id, for admin ui' })
    @ApiResponse({ status: 200, description: 'Report found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async findOne(@Param('id') id: number): Promise<Report> {
        return await this.reportsService.findOne(id);
    }

    // mark report as resolved (admin)
    @Roles('admin')
    @Put(':id/resolve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark report as resolved (admin)' })
    @ApiResponse({ status: 200, description: 'Report resolved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async resolve(
        @Param('id') id: number,
        @Body() resolveReportDto: ResolveReportDto,
    ): Promise<Report> {
        const { actionTaken } = resolveReportDto;
        return await this.reportsService.resolveReport(id, actionTaken);
    }
}
