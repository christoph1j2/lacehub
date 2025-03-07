import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wts } from '../entities/wts.entity';
import { Repository } from 'typeorm';
import { CreateWTSDto } from './dto/create-wts.dto';
import { User } from '../entities/user.entity';
import { UpdateWTSDto } from './dto/update-wts.dto';
import { Product } from '../entities/product.entity';

/**
 * Service responsible for managing Want to Sell (WTS) listings.
 *
 * This service provides functionality to create, retrieve, update, and delete
 * WTS listings, which represent products that users are looking to sell.
 * It also includes analytics features like finding the most popular products
 * users want to sell.
 */
@Injectable()
export class WtsService {
    /**
     * Creates an instance of WtsService.
     *
     * @param wtsRepository - Repository for WTS entity operations
     * @param userRepository - Repository for user entity operations
     * @param productRepository - Repository for product entity operations
     */
    constructor(
        @InjectRepository(Wts)
        private readonly wtsRepository: Repository<Wts>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    /**
     * Retrieves all WTS listings from the database.
     *
     * @returns Promise resolving to an array of all WTS listings with related user and product data
     */
    async findAll(): Promise<Wts[]> {
        return await this.wtsRepository.find({
            relations: ['user', 'product'],
        });
    }

    /**
     * Retrieves all WTS listings for a specific user.
     *
     * @param userId - The ID of the user whose WTS listings to retrieve
     * @returns Promise resolving to an array of the user's WTS listings with related user and product data
     */
    async findByUser(userId: number): Promise<Wts[]> {
        return await this.wtsRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'product'],
        });
    }

    /**
     * Creates a new WTS listing.
     * If a listing with the same product and size already exists for the user,
     * the quantity is added to the existing listing instead.
     *
     * @param createWTSDto - Data transfer object containing WTS listing details
     * @param authenthicatedUserId - ID of the authenticated user creating the listing
     * @returns Promise resolving to the created or updated WTS listing
     * @throws NotFoundException if the user or product is not found
     */
    async create(
        createWTSDto: CreateWTSDto,
        authenthicatedUserId: number,
    ): Promise<Wts> {
        const userId = authenthicatedUserId;

        // fetch user
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId}  not found`);
        }

        // fetch product
        const product = await this.productRepository.findOneBy({
            id: createWTSDto.productId,
        });
        if (!product) {
            throw new NotFoundException(
                `Product with ID ${createWTSDto.productId} not found`,
            );
        }

        const existingWts = await this.wtsRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: product.id },
                size: createWTSDto.size,
            },
        });
        if (existingWts) {
            existingWts.quantity += createWTSDto.quantity;
            return await this.wtsRepository.save(existingWts);
        }

        const wts = this.wtsRepository.create({
            user,
            product,
            size: createWTSDto.size,
            quantity: createWTSDto.quantity,
        });

        return await this.wtsRepository.save(wts);
    }

    /**
     * Updates an existing WTS listing.
     *
     * @param id - ID of the WTS listing to update
     * @param updateWTSDto - Data transfer object containing updated listing details
     * @param userId - ID of the authenticated user attempting to update the listing
     * @returns Promise resolving to the updated WTS listing
     * @throws NotFoundException if the WTS listing is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the listing
     */
    async update(
        id: number,
        updateWTSDto: UpdateWTSDto,
        userId: number,
    ): Promise<Wts> {
        const existingWts = await this.wtsRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });

        if (!existingWts) {
            throw new NotFoundException('WTS item not found');
        }

        if (existingWts.user.id !== userId) {
            throw new ForbiddenException(
                'You are not authorized to perform this action',
            );
        }

        await this.wtsRepository.update(id, updateWTSDto);

        return await this.wtsRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });
    }

    /**
     * Deletes a WTS listing.
     *
     * @param itemId - ID of the WTS listing to delete
     * @param userId - ID of the authenticated user attempting to delete the listing
     * @returns Promise that resolves when deletion is complete
     * @throws NotFoundException if the WTS listing is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the listing
     */
    async delete(itemId: number, userId: number): Promise<void> {
        const item = await this.wtsRepository.findOne({
            where: { id: itemId },
            relations: ['user'],
        });

        if (!item) {
            throw new NotFoundException('WTS item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to delete this WTS item',
            );
        }

        await this.wtsRepository.delete(itemId);
    }

    /**
     * Retrieves the top 10 most frequently offered products based on total quantity in WTS listings.
     *
     * @returns Promise resolving to an array of objects containing product ID, name, and total quantity
     */
    async topProducts(): Promise<any> {
        return await this.wtsRepository
            .createQueryBuilder('wts')
            .leftJoin('wts.product', 'product')
            .select(
                'wts.product_id, product.name as product_name, SUM(wts.quantity) as total',
            )
            .groupBy('wts.product_id, product.name')
            .orderBy('total', 'DESC')
            .limit(10)
            .getRawMany();
    }
}
