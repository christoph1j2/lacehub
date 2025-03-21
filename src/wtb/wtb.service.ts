import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wtb } from '../entities/wtb.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateWTBDto } from './dto/create-wtb.dto';
import { User } from '../entities/user.entity';
import { UpdateWTBDto } from './dto/update-wtb.dto';
import { Product } from '../entities/product.entity';

/**
 * Service responsible for managing Want to Buy (WTB) listings.
 *
 * This service provides functionality to create, retrieve, update, and delete
 * WTB listings, which represent products that users are looking to purchase.
 * It also includes analytics features like finding the most popular products
 * users want to buy.
 */
@Injectable()
export class WtbService {
    /**
     * Creates an instance of WtbService.
     *
     * @param wtbRepository - Repository for WTB entity operations
     * @param userRepository - Repository for user entity operations
     * @param productRepository - Repository for product entity operations
     */
    constructor(
        @InjectRepository(Wtb)
        private readonly wtbRepository: Repository<Wtb>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Retrieves all WTB listings from the database.
     *
     * @returns Promise resolving to an array of all WTB listings with related user and product data
     */
    async findAll(): Promise<Wtb[]> {
        return await this.wtbRepository.find({
            relations: ['user', 'product'],
        });
    }

    /**
     * Retrieves all WTB listings for a specific user.
     *
     * @param userId - The ID of the user whose WTB listings to retrieve
     * @returns Promise resolving to an array of the user's WTB listings with related user and product data
     */
    async findByUser(userId: number): Promise<Wtb[]> {
        return await this.wtbRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'product'],
        });
    }

    /**
     * Creates a new WTB listing.
     * If a listing with the same product and size already exists for the user,
     * the quantity is added to the existing listing instead.
     *
     * @param createWTBDto - Data transfer object containing WTB listing details
     * @param authenthicatedUserId - ID of the authenticated user creating the listing
     * @returns Promise resolving to the created or updated WTB listing
     * @throws NotFoundException if the user or product is not found
     */
    async create(
        createWTBDto: CreateWTBDto,
        authenthicatedUserId: number,
    ): Promise<Wtb> {
        const userId = authenthicatedUserId;

        // fetch user
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // fetch product
        const product = await this.productRepository.findOneBy({
            id: createWTBDto.productId,
        });
        if (!product) {
            throw new NotFoundException(
                `Product with ID ${createWTBDto.productId} not found`,
            );
        }

        const existingWtb = await this.wtbRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: product.id },
                size: createWTBDto.size,
            },
        });
        if (existingWtb) {
            existingWtb.quantity += createWTBDto.quantity;
            return await this.wtbRepository.save(existingWtb);
        }

        const wtb = this.wtbRepository.create({
            user,
            product,
            size: createWTBDto.size,
            quantity: createWTBDto.quantity,
        });

        return await this.wtbRepository.save(wtb);
    }

    /**
     * Updates an existing WTB listing.
     *
     * @param id - ID of the WTB listing to update
     * @param updateWTBDto - Data transfer object containing updated listing details
     * @param userId - ID of the authenticated user attempting to update the listing
     * @returns Promise resolving to the updated WTB listing
     * @throws NotFoundException if the WTB listing is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the listing
     */
    async update(
        id: number,
        updateWTBDto: UpdateWTBDto,
        userId: number,
    ): Promise<Wtb> {
        const existingWtb = await this.wtbRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });

        if (!existingWtb) {
            throw new NotFoundException('WTB item not found');
        }

        if (existingWtb.user.id !== userId) {
            throw new ForbiddenException(
                'You are not authorized to perform this action',
            );
        }

        await this.wtbRepository.update(id, updateWTBDto);

        return await this.wtbRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });
    }

    /**
     * Deletes a WTB listing.
     *
     * @param itemId - ID of the WTB listing to delete
     * @param userId - ID of the authenticated user attempting to delete the listing
     * @returns Promise that resolves when deletion is complete
     * @throws NotFoundException if the WTB listing is not found
     * @throws ForbiddenException if the authenticated user is not the owner of the listing
     */
    async delete(itemId: number, userId: number): Promise<void> {
        const item = await this.wtbRepository.findOne({
            where: { id: itemId },
            relations: ['user', 'matches'],
        });

        if (!item) {
            throw new NotFoundException('WTB item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to delete this WTB item',
            );
        }

        // First delete any related matches
        if (item.matches && item.matches.length > 0) {
            await this.dataSource
                .createQueryBuilder()
                .delete()
                .from('matches')
                .where('wtb_id = :wtbId', { wtbId: itemId })
                .execute();
        }

        // Now it's safe to delete the WTB item
        await this.wtbRepository.delete(itemId);
    }

    /**
     * Retrieves the top 10 most wanted products based on total quantity in WTB listings.
     *
     * @returns Promise resolving to an array of objects containing product ID, name, and total quantity
     */
    async topProducts(): Promise<any> {
        return await this.wtbRepository
            .createQueryBuilder('wtb')
            .leftJoin('wtb.product', 'product')
            .select(
                'wtb.product_id, product.name as product_name, SUM(wtb.quantity) as total',
            )
            .groupBy('wtb.product_id, product.name')
            .orderBy('total', 'DESC')
            .limit(10)
            .getRawMany();
    }
}
