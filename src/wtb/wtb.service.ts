import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wtb } from '../entities/wtb.entity';
import { Repository } from 'typeorm';
import { CreateWTBDto } from './dto/create-wtb.dto';
import { User } from '../entities/user.entity';
import { UpdateWTBDto } from './dto/update-wtb.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class WtbService {
    constructor(
        @InjectRepository(Wtb)
        private readonly wtbRepository: Repository<Wtb>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async findAll(): Promise<Wtb[]> {
        return await this.wtbRepository.find({
            relations: ['user', 'product'],
        });
    }

    async findByUser(userId: number): Promise<Wtb[]> {
        return await this.wtbRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'product'],
        });
    }

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
            throw new NotFoundException(`User with ID ${userId}  not found`);
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

    async delete(itemId: number, userId: number): Promise<void> {
        const item = await this.wtbRepository.findOne({
            where: { id: itemId },
            relations: ['user'],
        });

        if (!item) {
            throw new NotFoundException('WTB item not found');
        }

        if (item.user.id !== userId) {
            throw new ForbiddenException(
                'You do not have permission to delete this WTB item',
            );
        }

        await this.wtbRepository.delete(itemId);
    }

    // TOP 10 most popular products in inventory (using typeORM)
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
