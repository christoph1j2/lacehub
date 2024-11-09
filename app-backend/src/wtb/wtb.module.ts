import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wtb } from 'src/entities/wtb.entity';
import { WtbController } from './wtb.controller';
import { WtbService } from './wtb.service';

@Module({
    imports: [TypeOrmModule.forFeature([Wtb])],
    controllers: [WtbController],
    providers: [WtbService],
})
export class WtbModule {}
