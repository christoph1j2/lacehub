import { Test, TestingModule } from '@nestjs/testing';
import { WtsController } from './wts.controller';
import { WtsService } from './wts.service';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { CreateWTSDto } from './dto/create-wts.dto';
import { UpdateWTSDto } from './dto/update-wts.dto';

describe('WtsController', () => {
    let controller: WtsController;
    let service: WtsService;

    const mockWtsService = {
        findAll: jest.fn(),
        findByUser: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WtsController],
            providers: [
                {
                    provide: WtsService,
                    useValue: mockWtsService,
                },
            ],
        })
            .overrideGuard(VerifiedUserGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<WtsController>(WtsController);
        service = module.get<WtsService>(WtsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of WTS items', async () => {
            const result = [{ id: 1, size: '10', quantity: 1 }];
            jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

            expect(await controller.findAll()).toBe(result);
        });
    });

    describe('findByUser', () => {
        it('should return WTS items for the user', async () => {
            const req = { user: { id: 1 } };
            const result = [
                {
                    id: 1,
                    size: '10',
                    quantity: 1,
                    product: {
                        name: 'Product 1',
                        sku: 'SKU123',
                        description: 'Description',
                        image_link: 'image_link',
                    },
                    user: { id: 1, username: 'testuser' }, // Mock user property
                    matches: [], // Mock matches property
                },
            ];
            jest.spyOn(service, 'findByUser').mockResolvedValue(result as any);

            expect(await controller.findByUser(req)).toEqual(
                result.map((item) => ({
                    id: item.id,
                    size: item.size,
                    quantity: item.quantity,
                    product: {
                        name: item.product.name,
                        sku: item.product.sku,
                        description: item.product.description,
                        image_link: item.product.image_link,
                    },
                })),
            );
        });
    });

    describe('create', () => {
        it('should create a WTS item', async () => {
            const createDto: CreateWTSDto = {
                size: '10',
                quantity: 1,
                productId: 1,
            };
            const req = { user: { id: 1 } };
            const result = { id: 1, ...createDto };
            jest.spyOn(service, 'create').mockResolvedValue(result as any);

            expect(await controller.create(createDto, req)).toBe(result);
        });
    });

    describe('update', () => {
        it('should update a WTS item', async () => {
            const updateDto: UpdateWTSDto = { size: '12', quantity: 2 };
            const user = { id: 1 };
            const result = { id: 1, ...updateDto };
            jest.spyOn(service, 'update').mockResolvedValue(result as any);

            expect(await controller.update(1, updateDto, user)).toBe(result);
        });
    });

    describe('delete', () => {
        it('should delete a WTS item', async () => {
            const user = { id: 1 };
            const result = { success: true };
            jest.spyOn(service, 'delete').mockResolvedValue(result as any);

            expect(await controller.delete(1, user)).toBe(result);
        });
    });
});
