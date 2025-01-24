import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInventory } from 'src/entities/userInventory.entity';
import { UserInventoryController } from './user-inventory.controller';
import { UserInventoryService } from './user-inventory.service';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { WtbModule } from 'src/wtb/wtb.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserInventory, User, Product]),
        WtbModule,
    ],
    controllers: [UserInventoryController],
    providers: [UserInventoryService],
})
export class UserInventoryModule {}
