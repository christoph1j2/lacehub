import { Test, TestingModule } from '@nestjs/testing';
import { WtbService } from './wtb.service';
import { Repository } from 'typeorm';
import { Wtb } from '../entities/wtb.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateWTBDto } from './dto/create-wtb.dto';
import { UpdateWTBDto } from './dto/update-wtb.dto';

describe('WtbService', () => {
    let service: WtbService;
    let wtbRepository: Repository<Wtb>;
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

    const mockWtb = {
        id: 1,
        user: mockUser,
        product: mockProduct,
        size: 'M',
        quantity: 1,
        // Add any other required properties from the Wtb entity
        matches: [], // if matches is a required field
    } as Wtb;

    const mockWtbRepository = {
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
                WtbService,
                {
                    provide: getRepositoryToken(Wtb),
                    useValue: mockWtbRepository,
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

        service = module.get<WtbService>(WtbService);
        wtbRepository = module.get<Repository<Wtb>>(getRepositoryToken(Wtb));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        productRepository = module.get<Repository<Product>>(
            getRepositoryToken(Product),
        );
    });

    jest.clearAllMocks();

    describe('findAll', () => {
        it('should return an array of WTB items', async () => {
            const expectedResult = [mockWtb];
            jest.spyOn(wtbRepository, 'find').mockResolvedValue(expectedResult);

            const result = await service.findAll();
            expect(result).toEqual(expectedResult);
            expect(wtbRepository.find).toHaveBeenCalledWith({
                relations: ['user', 'product'],
            });
        });
    });

    describe('findByUser', () => {
        it('should return WTB items for a specific user', async () => {
            const userId = 1;
            const expectedResult = [mockWtb];
            jest.spyOn(wtbRepository, 'find').mockResolvedValue(expectedResult);

            const result = await service.findByUser(userId);
            expect(result).toEqual(expectedResult);
            expect(wtbRepository.find).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['user', 'product'],
            });
        });
    });

    describe('create', () => {
        const createDto: CreateWTBDto = {
            productId: 1,
            size: 'M',
            quantity: 1,
        };

        it('should create a new WTB item', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(
                mockProduct,
            );
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(wtbRepository, 'create').mockReturnValue(mockWtb);
            jest.spyOn(wtbRepository, 'save').mockResolvedValue(mockWtb);

            const result = await service.create(createDto, mockUser.id);
            expect(result).toEqual(mockWtb);
        });

        it('should update quantity if WTB item already exists', async () => {
            const existingWtb = { ...mockWtb, quantity: 1 };
            const updatedWtb = { ...mockWtb, quantity: 2 };

            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(
                mockProduct,
            );
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValue(existingWtb);
            jest.spyOn(wtbRepository, 'save').mockResolvedValue(updatedWtb);

            const result = await service.create(createDto, mockUser.id);
            expect(result).toEqual(updatedWtb);
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
        const updateDto: UpdateWTBDto = {
            quantity: 2,
        };

        it('should update a WTB item', async () => {
            jest.clearAllMocks();
            const originalWtb: Wtb = {
                id: 1,
                user: mockUser,
                product: mockProduct,
                size: 'M',
                quantity: 1,
                matches: [], // ensure this is included if required
            };
            const updatedWtb: Wtb = {
                ...originalWtb,
                quantity: 2,
            };

            // Mock findOne to return the original WTB item
            const findOneMock = jest
                .spyOn(wtbRepository, 'findOne')
                .mockResolvedValueOnce(originalWtb); // First call to check existing item

            // Mock the update method
            jest.spyOn(wtbRepository, 'update').mockResolvedValue(undefined);

            // Mock the second findOne to return the updated WTB after fetching
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValueOnce(
                updatedWtb,
            );

            const result = await service.update(1, updateDto, mockUser.id);

            expect(result).toEqual(updatedWtb);
            expect(findOneMock).toHaveBeenCalledTimes(2);
            expect(findOneMock).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'product'],
            });
            expect(wtbRepository.update).toHaveBeenCalledWith(1, updateDto);
        });

        it('should throw NotFoundException if WTB item not found', async () => {
            // Explicitly mock findOne to return null
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValue(null);

            await expect(
                service.update(999, updateDto, mockUser.id),
            ).rejects.toThrow(NotFoundException);

            // Verify findOne was called with correct parameters
            expect(wtbRepository.findOne).toHaveBeenCalledWith({
                where: { id: 999 },
                relations: ['user', 'product'],
            });
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            // Create a WTB item with a different user ID
            const wtbWithDifferentUser: Wtb = {
                id: 1,
                user: { id: 999 } as User, // Different user ID
                product: mockProduct,
                size: 'M',
                quantity: 1,
                matches: [], // ensure this is included if required
            };

            // Explicitly mock findOne to return WTB with different user
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValue(
                wtbWithDifferentUser,
            );

            await expect(
                service.update(1, updateDto, mockUser.id),
            ).rejects.toThrow(ForbiddenException);

            expect(wtbRepository.findOne).toHaveBeenCalledWith({
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
        it('should delete a WTB item', async () => {
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValue(mockWtb);
            jest.spyOn(wtbRepository, 'delete').mockResolvedValue(undefined);

            await service.delete(1, mockUser.id);
            expect(wtbRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if WTB item not found', async () => {
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValue(null);

            await expect(service.delete(999, mockUser.id)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException if user is not authorized', async () => {
            jest.spyOn(wtbRepository, 'findOne').mockResolvedValue(mockWtb);

            await expect(service.delete(1, 999)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });
});
