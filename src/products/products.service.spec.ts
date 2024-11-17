import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * * Main test suite for ProductsService
 */
describe('ProductsService', () => {
    let service: ProductsService;
    let repository: Repository<Product>;

    // * Mock product data for testing
    const mockProduct: Product = {
        id: 1,
        sku: 'SKU123',
        name: 'Sample Product',
        description: 'A sample product description',
        image_link: 'http://example.com/image.jpg',
        inventory: [],
        created_at: new Date(),
    };

    // * Mock result for update operations
    const updateResult: UpdateResult = {
        generatedMaps: [],
        raw: {},
        affected: 1,
    };

    /**
     * ? Setup function to initialize testing module and mock repository
     */
    beforeEach(async () => {
        const mockProductRepository = {
            create: jest.fn().mockImplementation((dto) => ({
                ...dto,
                inventory: 100,
                created_at: new Date(),
            })),
            save: jest.fn().mockResolvedValue(mockProduct),
            find: jest.fn().mockResolvedValue([mockProduct]),
            findOne: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue(updateResult),
            delete: jest.fn().mockResolvedValue(updateResult),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        repository = module.get<Repository<Product>>(
            getRepositoryToken(Product),
        );
    });

    /**
     * ? Clear all mocks after each test to prevent interference
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * ! Test to ensure service is defined
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * * Test suite for create method
     */
    describe('create', () => {
        it('should create a new product', async () => {
            const dto: CreateProductDto = {
                sku: 'SKU123',
                name: 'Sample Product',
                description: 'A sample product description',
                image_link: 'http://example.com/image.jpg',
            };

            const result = await service.create(dto);
            expect(repository.create).toHaveBeenCalledWith(dto);
            expect(repository.save).toHaveBeenCalledWith({
                ...dto,
                inventory: 100,
                created_at: expect.any(Date),
            });
            expect(result).toEqual(mockProduct);
        });
    });

    /**
     * * Test suite for findAll method
     */
    describe('findAll', () => {
        it('should return an array of products', async () => {
            const result = await service.findAll();
            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual([mockProduct]);
        });
    });

    /**
     * * Test suite for findOne method
     */
    describe('findOne', () => {
        it('should return a single product by ID', async () => {
            const result = await service.findOne(1);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundException if product not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    /**
     * * Test suite for update method
     */
    describe('update', () => {
        it('should update a product by ID', async () => {
            const updateDto: UpdateProductDto = { name: 'Updated Name' };

            // * Mock the update call
            jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

            // * Mock the findOne call that happens after update
            jest.spyOn(repository, 'findOne').mockResolvedValue({
                ...mockProduct,
                ...updateDto,
            });

            const result = await service.update(1, updateDto);

            expect(repository.update).toHaveBeenCalledWith(1, updateDto);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual({
                ...mockProduct,
                ...updateDto,
            });
        });

        it('should throw NotFoundException if product to update is not found', async () => {
            const updateDto: UpdateProductDto = { name: 'Updated Name' };

            // * Mock update to succeed
            jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

            // * Mock findOne to return null (product not found after update)
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    /**
     * * Test suite for delete method
     */
    describe('delete', () => {
        it('should delete a product by ID', async () => {
            const deleteResult: UpdateResult = {
                generatedMaps: [],
                raw: {},
                affected: 1,
            };

            jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

            const result = await service.delete(1);
            expect(repository.delete).toHaveBeenCalledWith(1);
            expect(result).toBeUndefined();
        });

        it('should throw NotFoundException if product to delete is not found', async () => {
            const deleteResult: UpdateResult = {
                generatedMaps: [],
                raw: {},
                affected: 0,
            };

            jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

            await expect(service.delete(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
