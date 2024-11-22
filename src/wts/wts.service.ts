import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wts } from 'src/entities/wts.entity';
import { Repository } from 'typeorm';
import { CreateWTSDto } from './dto/create-wts.dto';
import { User } from 'src/entities/user.entity';
import { UpdateWTSDto } from './dto/update-wts.dto';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class WtsService {
    constructor(
        @InjectRepository(Wts)
        private readonly wtbRepository: Repository<Wts>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async findAll(): Promise<Wts[]> {
        return await this.wtbRepository.find({
            relations: ['user', 'product'],
        });
    }

    async findByUser(userId: number): Promise<Wts[]> {
        return await this.wtbRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'product'],
        });
    }

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

        const existingWts = await this.wtbRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: product.id },
                size: createWTSDto.size,
            },
        });
        if (existingWts) {
            existingWts.quantity += createWTSDto.quantity;
            return await this.wtbRepository.save(existingWts);
        }

        const wtb = this.wtbRepository.create({
            user,
            product,
            size: createWTSDto.size,
            quantity: createWTSDto.quantity,
        });

        return await this.wtbRepository.save(wtb);
    }

    async update(
        id: number,
        updateWTSDto: UpdateWTSDto,
        userId: number,
    ): Promise<Wts> {
        const existingWts = await this.wtbRepository.findOne({
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

        await this.wtbRepository.update(id, updateWTSDto);

        return await this.wtbRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });
    }

    async delete(itemId: number, userId: number): Promise<void> {
        const item = await this.wtbRepository.findOne({
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

        await this.wtbRepository.delete(itemId);
    }
}
