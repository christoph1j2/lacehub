import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
    ) {}

    // user reporting
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

    // list all reports for admin ui
    async findAll(): Promise<Report[]> {
        return await this.reportRepository.find({
            relations: ['reportedUser', 'reporterUser'],
        });
    }

    // get specific report by id for admin ui
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

    // mark report as resolved (admin)
    async resolveReport(id: number, actionTaken: string): Promise<Report> {
        const report = await this.findOne(id);
        report.resolved = true;
        report.action_taken = actionTaken;
        return await this.reportRepository.save(report);
    }

    // list all reports filed by specific user
    async findByReporterUserId(userId: number): Promise<Report[]> {
        return await this.reportRepository.find({
            where: { reporterUser: { id: userId } },
            relations: ['reportedUser', 'reporterUser'],
        });
    }
}
