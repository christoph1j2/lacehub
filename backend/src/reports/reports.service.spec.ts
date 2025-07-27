import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Report } from '../entities/report.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

describe('ReportsService', () => {
    let service: ReportsService;
    let repo: Repository<Report>;

    const mockRepository = {
        save: jest.fn(),
        create: jest.fn((report) => ({
            ...report,
            report_date: new Date(),
            resolved: false,
            action_taken: null,
        })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: getRepositoryToken(Report),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
        repo = module.get<Repository<Report>>(getRepositoryToken(Report));
    });

    it('should create a report', async () => {
        const mockReport = {
            reportText: 'This user violated the rules',
            reporterUserId: 1,
            reportedUserId: 2,
        };

        const savedReport = {
            ...mockReport,
            id: 1,
            report_date: new Date(),
            resolved: false,
            action_taken: null,
            report_text: mockReport.reportText,
            reporterUser: {
                id: mockReport.reporterUserId,
                username: 'reporterUsername', // add required properties
                email: 'reporterEmail',
                // ... other required properties
            } as User,
            reportedUser: {
                id: mockReport.reportedUserId,
                username: 'reportedUsername', // add required properties
                email: 'reportedEmail',
                // ... other required properties
            } as User,
        };

        jest.spyOn(repo, 'save').mockResolvedValue(savedReport);

        const result = await service.create(
            mockReport.reportText,
            mockReport.reporterUserId,
            mockReport.reportedUserId,
        );

        expect(repo.save).toHaveBeenCalledWith({
            report_text: mockReport.reportText,
            reporterUser: { id: mockReport.reporterUserId },
            reportedUser: { id: mockReport.reportedUserId },
            report_date: expect.any(Date),
            resolved: false,
            action_taken: null,
        });
        expect(result).toEqual(savedReport);
    });

    it('should throw an error if save fails', async () => {
        const mockReport = {
            reportText: 'This user violated the rules',
            reporterUserId: 1,
            reportedUserId: 2,
        };

        jest.spyOn(repo, 'save').mockRejectedValue(new Error('Database error'));

        await expect(
            service.create(
                mockReport.reportText,
                mockReport.reporterUserId,
                mockReport.reportedUserId,
            ),
        ).rejects.toThrow('Database error');
    });
});
