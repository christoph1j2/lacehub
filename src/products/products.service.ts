import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productsRepository.create(createProductDto);
        product.created_at = new Date();
        return this.productsRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return this.productsRepository.find();
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
        });
        if (!product)
            throw new NotFoundException(`Product with ID ${id} not found`);
        return product;
    }

    async update(
        id: number,
        updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        await this.productsRepository.update(id, updateProductDto);
        return this.findOne(id);
    }

    async delete(id: number): Promise<void> {
        const result = await this.productsRepository.delete(id);
        if (result.affected === 0)
            throw new NotFoundException(`Product with ID ${id} not found`);
    }

    async searchProducts(
        query: string,
        limit = 10,
        offset = 0,
    ): Promise<Product[]> {
        /**On the frontend:
         * Pass limit and offset as query parameters.
         * Use the currentPage and totalPages from the response for pagination UI.
         */
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
