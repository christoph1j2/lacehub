import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';

describe('ReportsController', () => {
    let controller: ReportsController;
    let service: ReportsService;

    const mockService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [
                {
                    provide: ReportsService,
                    useValue: mockService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<ReportsController>(ReportsController);
        service = module.get<ReportsService>(ReportsService);
    });

    it('should call service.create with correct data', async () => {
        const mockRequest = { user: { id: 1 } };
        const reportText = 'Inappropriate behavior';

        await controller.create(reportText, 2, mockRequest);

        expect(service.create).toHaveBeenCalledWith(reportText, 1, 2);
    });

    it('should throw an error if reportText is missing', async () => {
        const mockRequest = { user: { id: 1 } };

        await expect(controller.create('', 1, mockRequest)).rejects.toThrow(
            'Report text is required',
        );
    });
});
