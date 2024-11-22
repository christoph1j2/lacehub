import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    Request,
    UseGuards,
} from '@nestjs/common';
import { WtsService } from './wts.service';
import { Wts } from 'src/entities/wts.entity';
import { VerifiedUserGuard } from 'src/common/guards/verified-user.guard';
import { CreateWTSDto } from './dto/create-wts.dto';
import { UpdateWTSDto } from './dto/update-wts.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('wts')
export class WtsController {
    constructor(private readonly wtsService: WtsService) {}

    @Get()
    async findAll(): Promise<Wts[]> {
        return await this.wtsService.findAll();
    }

    @Get('user')
    async findByUser(@Request() req) {
        const userId = req.user.id;
        return await this.wtsService.findByUser(userId);
    }

    @UseGuards(VerifiedUserGuard)
    @Post()
    async create(@Body() createWTSDto: CreateWTSDto, @Req() req) {
        return await this.wtsService.create(createWTSDto, req.user.id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateWTSDto: UpdateWTSDto,
        @GetUser() user: { id: number },
    ) {
        return await this.wtsService.update(id, updateWTSDto, user.id);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return await this.wtsService.delete(id, user.id);
    }
}
