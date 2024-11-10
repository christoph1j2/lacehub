import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInventory } from '../entities/userInventory.entity';
import { Repository } from 'typeorm';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';

@Injectable()
export class UserInventoryService {
    constructor(
        @InjectRepository(UserInventory)
        private readonly userInventoryRepository: Repository<UserInventory>,
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
    ): Promise<UserInventory> {
        const inventoryItem = this.userInventoryRepository.create(
            createUserInventoryDto,
        );
        return await this.userInventoryRepository.save(inventoryItem);
    }

    async update(
        id: number,
        updateUserInventoryDto: UpdateUserInventoryDto,
    ): Promise<UserInventory> {
        const existingInventory = await this.userInventoryRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });

        if (!existingInventory) {
            throw new NotFoundException('Inventory item not found');
        }

        await this.userInventoryRepository.update(id, updateUserInventoryDto);
        return existingInventory;
    }

    async delete(id: number): Promise<void> {
        await this.userInventoryRepository.delete(id);
    }
}
