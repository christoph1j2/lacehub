/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UserInventoryService } from './user-inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInventory } from '../entities/userInventory.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { WtsService } from '../wts/wts.service';
import { WtbService } from '../wtb/wtb.service';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

describe('UserInventoryService', () => {
    let service: UserInventoryService;
    let repository: Repository<UserInventory>;
    let wtsService: WtsService;
    let wtbService: WtbService;

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
                users: [],
                role_name: '',
            },
            inventory: [],
            reviewsAsReviewer: [],
            reviewsAsSeller: [],
            reportsAsReported: [],
            reportsAsReporter: [],
            matchesAsBuyer: [],
            matchesAsSeller: [],
            wts: [],
            wtb: [],
            refreshToken: '',
        },
        product: {
            id: 1,
            sku: 'SKU123',
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            created_at: new Date(),
            updated_at: new Date(),
            image_link: '',
            inventory: [],
            wts: [],
            wtb: [],
        } as Product,
        size: 'M',
        quantity: 5,
    } as UserInventory;

    const mockRepository = {
        findOne: jest.fn(),
        delete: jest.fn(),
    };

    const mockWtsService = {
        create: jest.fn(),
    };

    const mockWtbService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserInventoryService,
                {
                    provide: getRepositoryToken(UserInventory),
                    useValue: mockRepository,
                },
                {
                    provide: WtsService,
                    useValue: mockWtsService,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {},
                },
                {
                    provide: WtbService,
                    useValue: mockWtbService,
                },
                {
                    provide: getRepositoryToken(Product),
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<UserInventoryService>(UserInventoryService);
        repository = module.get<Repository<UserInventory>>(
            getRepositoryToken(UserInventory),
        );
        wtsService = module.get<WtsService>(WtsService);
        wtbService = module.get<WtbService>(WtbService);

        jest.clearAllMocks();
    });

    describe('moveToWts', () => {
        it('should move an inventory item to WTS', async () => {
            mockRepository.findOne.mockResolvedValue(mockInventory);

            await service.moveToWts(1, 1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'product'],
            });
            expect(wtsService.create).toHaveBeenCalledWith(
                {
                    productId: mockInventory.product.id,
                    size: mockInventory.size,
                    quantity: mockInventory.quantity,
                },
                1,
            );
        });

        it('should throw NotFoundException if inventory item not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.moveToWts(1, 1)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            mockRepository.findOne.mockResolvedValue({
                ...mockInventory,
                user: { id: 2 },
            });

            await expect(service.moveToWts(1, 1)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    describe('moveToWtb', () => {
        it('should move an inventory item to WTB', async () => {
            mockRepository.findOne.mockResolvedValue(mockInventory);

            await service.moveToWtb(1, 1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'product'],
            });
            expect(wtbService.create).toHaveBeenCalledWith(
                {
                    productId: mockInventory.product.id,
                    size: mockInventory.size,
                    quantity: mockInventory.quantity,
                },
                1,
            );
        });

        it('should throw NotFoundException if inventory item not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.moveToWtb(1, 1)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            mockRepository.findOne.mockResolvedValue({
                ...mockInventory,
                user: { id: 2 },
            });

            await expect(service.moveToWtb(1, 1)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    describe('delete', () => {
        it('should delete an inventory item', async () => {
            mockRepository.findOne.mockResolvedValue(mockInventory);

            await service.delete(1, 1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user'],
            });
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if inventory item not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.delete(1, 1)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            mockRepository.findOne.mockResolvedValue({
                ...mockInventory,
                user: { id: 2 },
            });

            await expect(service.delete(1, 1)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });
});
