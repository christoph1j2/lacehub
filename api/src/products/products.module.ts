import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Product]), UsersModule],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
