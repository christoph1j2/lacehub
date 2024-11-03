import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInventory } from 'src/entities/userInventory.entity';
import { UserInventoryController } from './user-inventory.controller';
import { UserInventoryService } from './user-inventory.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserInventory]),
    ],
    controllers: [UserInventoryController],
    providers: [UserInventoryService],
})
export class UserInventoryModule {}
