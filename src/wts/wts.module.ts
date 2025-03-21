/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wts } from 'src/entities/wts.entity';
import { WtsController } from './wts.controller';
import { WtsService } from './wts.service';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { DataSource } from 'typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Wts, User, Product])],
    controllers: [WtsController],
    providers: [WtsService],
    exports: [WtsService],
})
export class WtsModule {}
