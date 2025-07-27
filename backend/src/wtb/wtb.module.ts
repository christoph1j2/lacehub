import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wtb } from 'src/entities/wtb.entity';
import { WtbController } from './wtb.controller';
import { WtbService } from './wtb.service';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Wtb, User, Product])],
    controllers: [WtbController],
    providers: [WtbService],
})
export class WtbModule {}
