import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInventory } from '../entities/userInventory.entity';
import { Repository } from 'typeorm';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { WtbService } from '../wtb/wtb.service';
import { WtsService } from '../wts/wts.service';

//import * as XLSX from 'xlsx';

@Injectable()
export class UserInventoryService {
    constructor(
        @InjectRepository(UserInventory)
        private readonly userInventoryRepository: Repository<UserInventory>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly wtbService: WtbService,
        private readonly wtsService: WtsService,
    ) {}

    // Get all inventory items
    async findAll(): Promise<UserInventory[]> {
        return await this.userInventoryRepository.find({
            relations: ['user', 'product'],
        });
    }

    // Get all inventory items for a user
    async findByUser(userId: number): Promise<UserInventory[]> {
        return await this.userInventoryRepository.find({
            where: { user: { id: userId } },
            relations: ['product'],
        });
    }

    // Create a new inventory item for a user
    async create(
        createUserInventoryDto: CreateUserInventoryDto,
        authenthicatedUserId: number,
    ): Promise<UserInventory> {
        const userId =
            /*createUserInventoryDto.userId ||*/ authenthicatedUserId;

        // fetch user
        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId}  not found`);
        }

        // fetch product
        const product = await this.productRepository.findOneBy({
            id: createUserInventoryDto.productId,
        });
        if (!product) {
            throw new NotFoundException(
                `Product with ID ${createUserInventoryDto.productId} not found`,
            );
        }

        const existingInventoryItem =
            await this.userInventoryRepository.findOne({
                where: {
                    user: { id: userId },
                    product: { id: product.id },
                    size: createUserInventoryDto.size,
                },
            });

        if (existingInventoryItem) {
            existingInventoryItem.quantity += createUserInventoryDto.quantity;
            return await this.userInventoryRepository.save(
                existingInventoryItem,
            );
        }

        const inventoryItem = this.userInventoryRepository.create({
            user,
            product,
            size: createUserInventoryDto.size,
            quantity: createUserInventoryDto.quantity,
        });

        return await this.userInventoryRepository.save(inventoryItem);
    }

    // Update an inventory item for a user
    async update(
        id: number,
        updateUserInventoryDto: UpdateUserInventoryDto,
        userId: number,
    ): Promise<UserInventory> {
        const existingInventory = await this.userInventoryRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });

        if (!existingInventory) {
            throw new NotFoundException('Inventory item not found');
        }

        if (existingInventory.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to update this inventory item',
            );
        }

        await this.userInventoryRepository.update(id, updateUserInventoryDto);

        return await this.userInventoryRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });
    }

    // Delete an inventory item for a user
    async delete(itemId: number, userId: number): Promise<void> {
        const item = await this.userInventoryRepository.findOne({
            where: { id: itemId },
            relations: ['user'],
        });

        if (!item) {
            throw new NotFoundException('Inventory item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to delete this inventory item',
            );
        }

        await this.userInventoryRepository.delete(itemId);
    }

    // Move an inventory item to WTB
    async moveToWtb(itemId: number, userId: number): Promise<void> {
        const item = await this.userInventoryRepository.findOne({
            where: { id: itemId },
            relations: ['user', 'product'],
        });

        if (!item) {
            throw new NotFoundException('Inventory item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to move this inventory item',
            );
        }

        await this.wtbService.create(
            {
                productId: item.product.id,
                size: item.size,
                quantity: item.quantity,
            },
            userId,
        );

        //? await this.userInventoryRepository.delete(itemId);
    }

    // Move an inventory item to WTS
    async moveToWts(itemId: number, userId: number): Promise<void> {
        const item = await this.userInventoryRepository.findOne({
            where: { id: itemId },
            relations: ['user', 'product'],
        });

        if (!item) {
            throw new NotFoundException('Inventory item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to move this inventory item',
            );
        }

        await this.wtsService.create(
            {
                productId: item.product.id,
                size: item.size,
                quantity: item.quantity,
            },
            userId,
        );

        //? await this.userInventoryRepository.delete(itemId);
    }

    //! TODO: I don't know how to test this without frontend, future feature
    /* async upload(fileBuffer: Buffer, userId: number): Promise<any> {
        const workbook = XLSX.read(fileBuffer);
        const sheetName = workbook.SheetNames[0];
        const data: any[] = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName],
        );

        const errors = [];
        const successes = [];

        for (const row of data) {
            try {
                const { sku, size, quantity } = row;

                if (!sku || !size || !quantity) {
                    throw new Error('Missing required fields');
                }

                const product = await this.productRepository.findOne({
                    where: { sku },
                });

                if (!product) {
                    throw new Error(`Product with SKU ${sku} not found`);
                }

                // Check for existing inventory
                const existingItem = await this.userInventoryRepository.findOne(
                    {
                        where: {
                            user: { id: userId },
                            product: { id: product.id },
                            size,
                        },
                    },
                );

                if (existingItem) {
                    existingItem.quantity += Number(quantity);
                    await this.userInventoryRepository.save(existingItem);
                } else {
                    const newItem = this.userInventoryRepository.create({
                        user: { id: userId },
                        product,
                        size,
                        quantity: Number(quantity),
                    });
                    await this.userInventoryRepository.save(newItem);
                }

                successes.push(row);
            } catch (error) {
                errors.push({ row, error: error.message });
            }
        }

        return { successes, errors };
    } */
}
