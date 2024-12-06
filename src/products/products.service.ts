import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
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

    async searchProducts(query: string, limit = 10): Promise<Product[]> {
        return await this.productsRepository
            .createQueryBuilder('product')
            .where('product.name ILIKE :query', { query: `%${query}%` })
            .orWhere('product.sku ILIKE :query', { query: `%${query}%` })
            .orWhere('product.description ILIKE :query', {
                query: `%${query}%`,
            })
            .limit(limit)
            .getMany();
    }
    //*caching?
}
