import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInventory } from 'src/entities/userInventory.entity';
import { UserInventoryController } from './user-inventory.controller';
import { UserInventoryService } from './user-inventory.service';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { WtbService } from 'src/wtb/wtb.service';
import { WtsService } from 'src/wts/wts.service';
import { Wtb } from 'src/entities/wtb.entity';
import { Wts } from 'src/entities/wts.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserInventory, User, Product, Wts, Wtb]),
    ],
    controllers: [UserInventoryController],
    providers: [UserInventoryService, WtbService, WtsService],
})
export class UserInventoryModule {}
