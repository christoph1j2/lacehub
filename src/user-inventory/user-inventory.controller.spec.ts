import { Test, TestingModule } from '@nestjs/testing';
import { UserInventoryController } from './user-inventory.controller';
import { UserInventoryService } from './user-inventory.service';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UserInventoryController', () => {
    let controller: UserInventoryController;
    let service: UserInventoryService;

    const mockInventory = {
        id: 1,
        size: 'M',
        quantity: 5,
        product: {
            name: 'Sample Product',
            sku: 'SKU123',
            description: 'A sample product description',
            image_link: 'http://example.com/image.jpg',
        },
    };

    const mockService = {
        findAll: jest.fn().mockResolvedValue([mockInventory]),
        findByUser: jest.fn().mockResolvedValue([mockInventory]),
        findOne: jest.fn().mockResolvedValue(mockInventory),
        create: jest.fn().mockResolvedValue(mockInventory),
        update: jest.fn().mockResolvedValue(mockInventory),
        moveToWts: jest
            .fn()
            .mockImplementation(async (itemId: number, userId: number) => {
                if (itemId === 999)
                    throw new NotFoundException('Inventory item not found');
                if (userId !== 1)
                    throw new ForbiddenException(
                        'You do not have permission to move this inventory item',
                    );
                return Promise.resolve();
            }),
        moveToWtb: jest
            .fn()
            .mockImplementation(async (itemId: number, userId: number) => {
                if (itemId === 999)
                    throw new NotFoundException('Inventory item not found');
                if (userId !== 1)
                    throw new ForbiddenException(
                        'You do not have permission to move this inventory item',
                    );
                return Promise.resolve();
            }),
        delete: jest
            .fn()
            .mockImplementation(async (itemId: number, userId: number) => {
                if (itemId === 999)
                    throw new NotFoundException('Inventory item not found');
                if (userId !== 1)
                    throw new ForbiddenException(
                        'You do not have permission to delete this inventory item',
                    );
                return Promise.resolve();
            }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserInventoryController],
            providers: [
                {
                    provide: UserInventoryService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<UserInventoryController>(
            UserInventoryController,
        );
        service = module.get<UserInventoryService>(UserInventoryService);

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of user inventories', async () => {
            const result = await controller.findAll();
            expect(result).toEqual([mockInventory]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        it('should return an array of user inventories for a specific user', async () => {
            const req = { user: { id: 1 } };

            const result = await controller.findByUser(req);
            expect(result).toEqual([
                {
                    id: mockInventory.id,
                    size: mockInventory.size,
                    quantity: mockInventory.quantity,
                    product: mockInventory.product,
                },
            ]);
            expect(service.findByUser).toHaveBeenCalledWith(1);
        });
    });

    describe('create', () => {
        it('should create a new user inventory', async () => {
            const dto: CreateUserInventoryDto = {
                productId: 1,
                size: 'M',
                quantity: 5,
            };
            const req = { user: { id: 1 } };
            const result = await controller.create(dto, req);
            expect(result).toEqual(mockInventory);
            expect(service.create).toHaveBeenCalledWith(dto, req.user.id);
        });
    });

    describe('update', () => {
        it('should update a user inventory', async () => {
            const dto: UpdateUserInventoryDto = {
                size: 'L',
                quantity: 10,
            };
            const userId = 1;
            const result = await controller.update(1, dto, { id: userId });
            expect(result).toEqual(mockInventory);
            expect(service.update).toHaveBeenCalledWith(1, dto, userId);
        });
    });

    describe('moveToWts', () => {
        it('should successfully move an inventory item to WTS', async () => {
            const userId = 1;
            await expect(
                controller.moveToWts(1, { id: userId }),
            ).resolves.not.toThrow();
            expect(service.moveToWts).toHaveBeenCalledWith(1, userId);
        });

        it('should throw NotFoundException if inventory item not found', async () => {
            await expect(controller.moveToWts(999, { id: 1 })).rejects.toThrow(
                NotFoundException,
            );
            expect(service.moveToWts).toHaveBeenCalledWith(999, 1);
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            await expect(controller.moveToWts(1, { id: 2 })).rejects.toThrow(
                ForbiddenException,
            );
            expect(service.moveToWts).toHaveBeenCalledWith(1, 2);
        });
    });

    describe('moveToWtb', () => {
        it('should successfully move an inventory item to WTB', async () => {
            const userId = 1;
            await expect(
                controller.moveToWtb(1, { id: userId }),
            ).resolves.not.toThrow();
            expect(service.moveToWtb).toHaveBeenCalledWith(1, userId);
        });

        it('should throw NotFoundException if inventory item not found', async () => {
            await expect(controller.moveToWtb(999, { id: 1 })).rejects.toThrow(
                NotFoundException,
            );
            expect(service.moveToWtb).toHaveBeenCalledWith(999, 1);
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            await expect(controller.moveToWtb(1, { id: 2 })).rejects.toThrow(
                ForbiddenException,
            );
            expect(service.moveToWtb).toHaveBeenCalledWith(1, 2);
        });
    });

    describe('delete', () => {
        it('should successfully delete a user inventory item', async () => {
            const userId = 1;
            await expect(
                controller.delete(1, { id: userId }),
            ).resolves.not.toThrow();
            expect(service.delete).toHaveBeenCalledWith(1, userId);
        });

        it('should throw NotFoundException if inventory item not found', async () => {
            await expect(controller.delete(999, { id: 1 })).rejects.toThrow(
                NotFoundException,
            );
            expect(service.delete).toHaveBeenCalledWith(999, 1);
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            await expect(controller.delete(1, { id: 2 })).rejects.toThrow(
                ForbiddenException,
            );
            expect(service.delete).toHaveBeenCalledWith(1, 2);
        });
    });
});
