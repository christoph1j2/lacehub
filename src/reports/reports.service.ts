import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

/**
 * Service responsible for managing user reports in the system.
 *
 * Provides methods for creating and managing user reports, including
 * functionality for users to report other users and for administrators
 * to review and resolve those reports.
 */
@Injectable()
export class ReportsService {
    /**
     * Creates an instance of the ReportsService.
     *
     * @param reportRepository - Repository for report entity database operations
     */
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
    ) {}

    /**
     * Creates a new user report in the system.
     *
     * @param reportText - The content of the report detailing the issue
     * @param reporterUserId - The ID of the user filing the report
     * @param reportedUserId - The ID of the user being reported
     * @returns Promise resolving to the newly created report entity
     */
    async create(
        reportText: string,
        reporterUserId: number,
        reportedUserId: number,
    ): Promise<Report> {
        const report = this.reportRepository.create({
            report_text: reportText,
            report_date: new Date(),
            resolved: false,
            action_taken: '',
            reportedUser: { id: reportedUserId },
            reporterUser: { id: reporterUserId },
        });
        return await this.reportRepository.save(report);
    }

    /**
     * Retrieves all reports from the database for administrative review.
     *
     * @returns Promise resolving to an array of all report entities with user relations
     */
    async findAll(): Promise<Report[]> {
        return await this.reportRepository.find({
            relations: ['reportedUser', 'reporterUser'],
        });
    }

    /**
     * Retrieves a specific report by its ID for administrative review.
     *
     * @param id - The unique identifier of the report to retrieve
     * @returns Promise resolving to the found report entity with user relations
     * @throws NotFoundException if no report with the given ID exists
     */
    async findOne(id: number): Promise<Report> {
        const report = await this.reportRepository.findOne({
            where: { id },
            relations: ['reportedUser', 'reporterUser'],
        });
        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }
        return report;
    }

    /**
     * Marks a report as resolved and records the action taken by an administrator.
     *
     * @param id - The unique identifier of the report to resolve
     * @param actionTaken - Description of the administrative action taken to address the report
     * @returns Promise resolving to the updated report entity
     * @throws NotFoundException if no report with the given ID exists
     * @throws BadRequestException if the report is already resolved
     */
    async resolveReport(id: number, actionTaken: string): Promise<Report> {
        const report = await this.findOne(id);

        if (report.resolved) {
            throw new BadRequestException('Report already resolved');
        }
        report.resolved = true;
        report.action_taken = actionTaken;
        return await this.reportRepository.save(report);
    }

    /**
     * Retrieves all reports filed by a specific user.
     *
     * @param userId - The ID of the user who filed the reports
     * @returns Promise resolving to an array of reports filed by the specified user
     */
    async findByReporterUserId(userId: number): Promise<Report[]> {
        return await this.reportRepository.find({
            where: { reporterUser: { id: userId } },
            relations: ['reportedUser', 'reporterUser'],
        });
    }
}
