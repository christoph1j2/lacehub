import { Test, TestingModule } from '@nestjs/testing';
import { WtsService } from './wts.service';
import { Repository } from 'typeorm';
import { Wts } from '../entities/wts.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateWTSDto } from './dto/create-wts.dto';
import { UpdateWTSDto } from './dto/update-wts.dto';

describe('WtsService', () => {
    let service: WtsService;
    let wtsRepository: Repository<Wts>;
    let userRepository: Repository<User>;
    let productRepository: Repository<Product>;

    const mockUser = {
        id: 1,
        // add other necessary user properties
    } as User;

    const mockProduct = {
        id: 1,
        // add other necessary product properties
    } as Product;

    const mockWts = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        size: 'M',
        quantity: 1,
        // Add any other required properties from the Wts entity
        matches: [], // if matches is a required field
    } as Wts;

    const mockWtsRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WtsService,
                {
                    provide: getRepositoryToken(Wts),
                    useValue: mockWtsRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOneBy: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Product),
                    useValue: {
                        findOneBy: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<WtsService>(WtsService);
        wtsRepository = module.get<Repository<Wts>>(getRepositoryToken(Wts));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        productRepository = module.get<Repository<Product>>(
            getRepositoryToken(Product),
        );
    });

    jest.clearAllMocks();

    describe('findAll', () => {
        it('should return an array of WTS items', async () => {
            const expectedResult = [mockWts];
            jest.spyOn(wtsRepository, 'find').mockResolvedValue(expectedResult);

            const result = await service.findAll();
            expect(result).toEqual(expectedResult);
            expect(wtsRepository.find).toHaveBeenCalledWith({
                relations: ['user', 'product'],
            });
        });
    });

    describe('findByUser', () => {
        it('should return WTS items for a specific user', async () => {
            const userId = 1;
            const expectedResult = [mockWts];
            jest.spyOn(wtsRepository, 'find').mockResolvedValue(expectedResult);

            const result = await service.findByUser(userId);
            expect(result).toEqual(expectedResult);
            expect(wtsRepository.find).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['user', 'product'],
            });
        });
    });

    describe('create', () => {
        const createDto: CreateWTSDto = {
            productId: 1,
            size: 'M',
            quantity: 1,
        };

        it('should create a new WTS item', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(
                mockProduct,
            );
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(wtsRepository, 'create').mockReturnValue(mockWts);
            jest.spyOn(wtsRepository, 'save').mockResolvedValue(mockWts);

            const result = await service.create(createDto, mockUser.id);
            expect(result).toEqual(mockWts);
        });

        it('should update quantity if WTS item already exists', async () => {
            const existingWts = { ...mockWts, quantity: 1 };
            const updatedWts = { ...mockWts, quantity: 2 };

            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(
                mockProduct,
            );
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValue(existingWts);
            jest.spyOn(wtsRepository, 'save').mockResolvedValue(updatedWts);

            const result = await service.create(createDto, mockUser.id);
            expect(result).toEqual(updatedWts);
        });

        it('should throw NotFoundException if user not found', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

            await expect(service.create(createDto, 999)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw NotFoundException if product not found', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);

            await expect(
                service.create(createDto, mockUser.id),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateWTSDto = {
            quantity: 2,
        };

        it('should update a WTS item', async () => {
            jest.clearAllMocks();
            const originalWts: Wts = {
                id: 1,
                user: mockUser,
                product: mockProduct,
                size: 'M',
                quantity: 1,
                matches: [], // ensure this is included if required
            };
            const updatedWts: Wts = {
                ...originalWts,
                quantity: 2,
            };

            // Mock findOne to return the original WTS item
            const findOneMock = jest
                .spyOn(wtsRepository, 'findOne')
                .mockResolvedValueOnce(originalWts); // First call to check existing item

            // Mock the update method
            jest.spyOn(wtsRepository, 'update').mockResolvedValue(undefined);

            // Mock the second findOne to return the updated WTS after fetching
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValueOnce(
                updatedWts,
            );

            const result = await service.update(1, updateDto, mockUser.id);

            expect(result).toEqual(updatedWts);
            expect(findOneMock).toHaveBeenCalledTimes(2);
            expect(findOneMock).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'product'],
            });
            expect(wtsRepository.update).toHaveBeenCalledWith(1, updateDto);
        });

        it('should throw NotFoundException if WTS item not found', async () => {
            // Explicitly mock findOne to return null
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValue(null);

            await expect(
                service.update(999, updateDto, mockUser.id),
            ).rejects.toThrow(NotFoundException);

            // Verify findOne was called with correct parameters
            expect(wtsRepository.findOne).toHaveBeenCalledWith({
                where: { id: 999 },
                relations: ['user', 'product'],
            });
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            // Create a WTS item with a different user ID
            const wtsWithDifferentUser: Wts = {
                id: 1,
                user: { id: 999 } as User, // Different user ID
                product: mockProduct,
                size: 'M',
                quantity: 1,
                matches: [], // ensure this is included if required
            };

            // Explicitly mock findOne to return WTS with different user
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValue(
                wtsWithDifferentUser,
            );

            await expect(
                service.update(1, updateDto, mockUser.id),
            ).rejects.toThrow(ForbiddenException);

            expect(wtsRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'product'],
            });
        });

        // Add a cleanup after each test to reset mocks
        afterEach(() => {
            jest.clearAllMocks();
        });
    });

    describe('delete', () => {
        it('should delete a WTS item', async () => {
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValue(mockWts);
            jest.spyOn(wtsRepository, 'delete').mockResolvedValue(undefined);

            await service.delete(1, mockUser.id);
            expect(wtsRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if WTS item not found', async () => {
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValue(null);

            await expect(service.delete(999, mockUser.id)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            jest.spyOn(wtsRepository, 'findOne').mockResolvedValue(mockWts);

            await expect(service.delete(1, 999)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });
});
