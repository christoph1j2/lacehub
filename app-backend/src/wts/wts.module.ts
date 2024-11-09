import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wts } from 'src/entities/wts.entity';
import { WtsController } from './wts.controller';
import { WtsService } from './wts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wts])],
  controllers: [WtsController],
  providers: [WtsService],
})
export class WtsModule {}
