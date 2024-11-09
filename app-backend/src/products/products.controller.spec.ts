import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
    let controller: ProductsController;
    let service: ProductsService;

    const mockProduct = {
        id: 1,
        sku: 'SKU123',
        name: 'Sample Product',
        description: 'A sample product description',
        image_link: 'http://example.com/image.jpg',
        inventory: [],
        createdAt: new Date(),
    };

    const mockProductsService = {
        create: jest.fn().mockResolvedValue(mockProduct),
        findAll: jest.fn().mockResolvedValue([mockProduct]),
        findOne: jest.fn().mockResolvedValue(mockProduct),
        update: jest.fn().mockResolvedValue(mockProduct),
        delete: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: mockProductsService,
                },
            ],
        }).compile();

        controller = module.get<ProductsController>(ProductsController);
        service = module.get<ProductsService>(ProductsService);
    });

    afterEach(() => {
        jest.clearAllMocks(); //clears mock history
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new product', async () => {
            const createProductDto: CreateProductDto = {
                sku: 'SKU123',
                name: 'Sample Product',
                description: 'A sample product description',
                image_link: 'http://example.com/image.jpg',
            };
            const result = await controller.create(createProductDto);
            expect(service.create).toHaveBeenCalledWith(createProductDto);
            expect(result).toEqual(mockProduct);
        });
    });

    describe('findAll', () => {
        it('should return an array of products', async () => {
            const result = await controller.findAll();
            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockProduct]);
        });
    });

    describe('findOne', () => {
        it('should return a product by ID', async () => {
            const result = await controller.findOne(1);
            expect(service.findOne).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundException if product is not found', async () => {
            service.findOne = jest
                .fn()
                .mockRejectedValue(new NotFoundException());
            await expect(controller.findOne(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update a product by ID', async () => {
            const updateProductDto: UpdateProductDto = { name: 'Updated Name' };
            const result = await controller.update(1, updateProductDto);
            expect(service.update).toHaveBeenCalledWith(1, updateProductDto);
            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundException if product to update is not found', async () => {
            service.update = jest
                .fn()
                .mockRejectedValue(new NotFoundException());
            await expect(
                controller.update(999, {
                    name: 'Updated Name',
                    sku: '',
                    description: '',
                    image_link: '',
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete a product by ID', async () => {
            const result = await controller.delete(1);
            expect(service.delete).toHaveBeenCalledWith(1);
            expect(result).toBeUndefined();
        });

        it('should throw NotFoundException if product to delete is not found', async () => {
            service.delete = jest
                .fn()
                .mockRejectedValue(new NotFoundException());
            await expect(controller.delete(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
