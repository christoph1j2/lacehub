/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UserInventoryService } from './user-inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserInventory } from '../entities/userInventory.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';

describe('UserInventoryService', () => {
    let service: UserInventoryService;
    let repository: Repository<UserInventory>;

    const mockInventory: UserInventory = {
        id: 1,
        user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password_hash: 'hashedPassword',
            role_id: 1,
            verified: true,
            verificationToken: 'token',
            credibility_score: 0,
            is_banned: false,
            ban_expiration: null,
            resetToken: null,
            resetTokenExpires: null,
            created_at: new Date(),
            role: {
                id: 0,
                name: '',
                users: [],
            },
            inventory: [],
            reviewsAsReviewer: [],
            reviewsAsSeller: [],
            reportsAsReported: [],
            reportsAsReporter: [],
            matchesAsBuyer: [],
            matchesAsSeller: [],
        },
        product: {
            id: 1,
            sku: '',
            name: '',
            description: '',
            image_link: '',
            createdAt: undefined,
            inventory: [],
        },
        size: 'M',
        quantity: 5,
    };

    const createUserInventoryDto: CreateUserInventoryDto = {
        userId: 1,
        productId: 1,
        quantity: 10,
        size: '',
    };

    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn().mockResolvedValue(null), // Mock to return null when inventory item does not exist
        create: jest.fn().mockReturnValue(mockInventory),
        update: jest.fn().mockImplementation(() => {
            if (mockRepository.findOne.mock.calls[0][1].where.id === 99) {
                throw new NotFoundException(); // Throw an exception when the inventory item does not exist
            }
            return Promise.resolve({ affected: 1, raw: {}, generatedMaps: [] });
        }),
        delete: jest.fn(),
        save: jest.fn().mockResolvedValue(mockInventory),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserInventoryService,
                {
                    provide: getRepositoryToken(UserInventory),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UserInventoryService>(UserInventoryService);
        repository = module.get<Repository<UserInventory>>(
            getRepositoryToken(UserInventory),
        );
    });

    it('should retrieve all inventory items', async () => {
        jest.spyOn(repository, 'find').mockResolvedValue([mockInventory]);
        expect(await service.findAll()).toEqual([mockInventory]);
    });

    it('should retrieve inventory items for a specific user', async () => {
        jest.spyOn(repository, 'find').mockResolvedValue([mockInventory]);
        expect(await service.findByUser(1)).toEqual([mockInventory]);
    });

    it('should create a new inventory item', async () => {
        const createUserInventoryDto: CreateUserInventoryDto = {
            userId: 1,
            productId: 1,
            quantity: 5,
            size: 'M',
        };
        jest.spyOn(repository, 'create').mockReturnValue(mockInventory);
        jest.spyOn(repository, 'save').mockResolvedValue(mockInventory);
        expect(await service.create(createUserInventoryDto)).toEqual(
            mockInventory,
        );
    });

    it('should update an existing inventory item', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue(mockInventory);
        jest.spyOn(repository, 'update').mockResolvedValue({
            affected: 1,
            raw: {},
            generatedMaps: [],
        });
        jest.spyOn(repository, 'findOne').mockResolvedValueOnce({
            ...mockInventory,
            quantity: 10,
        });
        const updatedItem = await service.update(1, { quantity: 10 });
        expect(updatedItem.quantity).toBe(10);
    });

    it('should delete an inventory item', async () => {
        jest.spyOn(repository, 'delete').mockResolvedValue({
            affected: 1,
            raw: {},
        });
        await service.delete(1);
        expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if inventory item to update does not exist', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue(null);
        await expect(service.update(99, { quantity: 10 })).rejects.toThrow(
            NotFoundException,
        );
    });
});
