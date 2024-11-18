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

@Injectable()
export class UserInventoryService {
    constructor(
        @InjectRepository(UserInventory)
        private readonly userInventoryRepository: Repository<UserInventory>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async findAll(): Promise<UserInventory[]> {
        return await this.userInventoryRepository.find({
            relations: ['user', 'product'],
        });
    }

    async findByUser(userId: number): Promise<UserInventory[]> {
        return await this.userInventoryRepository.find({
            where: { user: { id: userId } },
            relations: ['product'],
        });
    }

    async create(
        createUserInventoryDto: CreateUserInventoryDto,
        authenthicatedUserId: number,
    ): Promise<UserInventory> {
        const userId =
            /*createUserInventoryDto.userId ||*/ authenthicatedUserId;

        const user = await this.userRepository.findOneBy({
            id: userId,
        });
        const product = await this.productRepository.findOneBy({
            id: createUserInventoryDto.productId,
        });

        if (!user || !product) {
            throw new NotFoundException(
                `User with ID ${createUserInventoryDto.userId} or product with ID ${createUserInventoryDto.productId} not found`,
            );
        }

        const existingInventoryItem =
            await this.userInventoryRepository.findOne({
                where: {
                    user: { id: userId },
                    product: { id: createUserInventoryDto.productId },
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
}
