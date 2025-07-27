import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

/**
 * Service responsible for managing product entities in the database.
 *
 * Provides methods for CRUD operations (create, read, update, delete) on products
 * and includes additional functionality like product search with caching support.
 */
@Injectable()
export class ProductsService {
    /**
     * Creates an instance of the ProductsService.
     *
     * @param productsRepository - Repository for product entity database operations
     * @param cacheManager - Cache manager for storing and retrieving cached results
     */
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * Creates a new product in the database.
     *
     * @param createProductDto - Data transfer object containing product information
     * @returns Promise resolving to the newly created product entity
     */
    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productsRepository.create(createProductDto);
        product.created_at = new Date();
        return this.productsRepository.save(product);
    }

    /**
     * Retrieves all products from the database.
     *
     * @returns Promise resolving to an array of all product entities
     */
    async findAll(): Promise<Product[]> {
        return this.productsRepository.find();
    }

    /**
     * Retrieves a single product by its ID.
     *
     * @param id - The unique identifier of the product to retrieve
     * @returns Promise resolving to the found product entity
     * @throws NotFoundException if no product with the given ID exists
     */
    async findOne(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
        });
        if (!product)
            throw new NotFoundException(`Product with ID ${id} not found`);
        return product;
    }

    /**
     * Updates an existing product's information.
     *
     * @param id - The unique identifier of the product to update
     * @param updateProductDto - Data transfer object containing the updated product information
     * @returns Promise resolving to the updated product entity
     * @throws NotFoundException if no product with the given ID exists
     */
    async update(
        id: number,
        updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        await this.productsRepository.update(id, updateProductDto);
        return this.findOne(id);
    }

    /**
     * Deletes a product from the database.
     *
     * @param id - The unique identifier of the product to delete
     * @returns Promise resolving when the product has been deleted
     * @throws NotFoundException if no product with the given ID exists
     */
    async delete(id: number): Promise<void> {
        const result = await this.productsRepository.delete(id);
        if (result.affected === 0)
            throw new NotFoundException(`Product with ID ${id} not found`);
    }

    /**
     * Searches for products matching a query string in SKU, name, or description.
     * Results are cached to improve performance for repeated searches.
     *
     * @param query - The search term to look for in products
     * @param limit - Maximum number of results to return (default: 10)
     * @param offset - Number of results to skip for pagination (default: 0)
     * @returns Promise resolving to an array of matching products
     *
     * @example
     * * // On the frontend:
     * * // Pass limit and offset as query parameters.
     * * // Use the currentPage and totalPages from the response for pagination UI.
     *
     */
    async searchProducts(
        query: string,
        limit = 10,
        offset = 0,
    ): Promise<Product[]> {
        const cacheKey = `search:${query}:${limit}:${offset}`;

        // Try to get cached results
        const cachedResults = await this.cacheManager.get<{
            results: Product[];
            total: number;
        }>(cacheKey);
        if (cachedResults) {
            return cachedResults.results;
        }

        // If not in cache, fetch from database
        const [results, total] = await this.productsRepository.findAndCount({
            where: [
                { sku: ILike(`%${query}%`) },
                { name: ILike(`%${query}%`) },
                { description: ILike(`%${query}%`) },
            ],
            take: limit,
            skip: offset,
        });

        // Cache the results for 5 minutes (300 seconds)
        const cacheData = { results, total };
        await this.cacheManager.set(cacheKey, cacheData, 300000);

        return cacheData.results;
    }
}
