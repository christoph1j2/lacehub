import { Test, TestingModule } from '@nestjs/testing';
import { UserInventoryController } from './user-inventory.controller';
import { UserInventoryService } from './user-inventory.service';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
//import { ExecutionContext } from '@nestjs/common';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';

describe('UserInventoryController', () => {
    let controller: UserInventoryController;
    let service: UserInventoryService;

    const mockInventory = {
        id: 1,
        user: { id: 1 },
        product: { id: 1 },
        size: 'M',
        quantity: 5,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserInventoryController],
            providers: [
                {
                    provide: UserInventoryService,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue([mockInventory]),
                        findByUser: jest
                            .fn()
                            .mockResolvedValue([mockInventory]),
                        create: jest.fn().mockResolvedValue(mockInventory),
                        update: jest.fn().mockResolvedValue({
                            ...mockInventory,
                            quantity: 10,
                        }),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        controller = module.get<UserInventoryController>(
            UserInventoryController,
        );
        service = module.get<UserInventoryService>(UserInventoryService);
    });

    it('should retrieve all inventory items', async () => {
        expect(await controller.findAll()).toEqual([mockInventory]);
    });

    it('should retrieve inventory items for the authenticated user', async () => {
        const req = { user: { id: 1 } };
        expect(await controller.findByUser(req)).toEqual([mockInventory]);
        expect(service.findByUser).toHaveBeenCalledWith(1);
    });

    it('should create a new inventory item', async () => {
        const dto: CreateUserInventoryDto = {
            //userId: 1,
            productId: 1,
            size: 'M',
            quantity: 5,
        };
        const req = { user: { id: 1 } };
        expect(await controller.create(dto, req)).toEqual(mockInventory);
        expect(service.create).toHaveBeenCalledWith(dto, req.user.id);
    });

    it('should update an inventory item', async () => {
        const dto: UpdateUserInventoryDto = { quantity: 10 };
        expect(await controller.update(1, dto, { id: 1 })).toEqual({
            ...mockInventory,
            quantity: 10,
        });
        expect(service.update).toHaveBeenCalledWith(1, dto, 1);
    });

    it('should delete an inventory item', async () => {
        await controller.delete(1, { id: 1 });
        expect(service.delete).toHaveBeenCalledWith(1, 1);
    });
});
