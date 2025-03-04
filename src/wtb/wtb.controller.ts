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
import { WtbService } from './wtb.service';
import { Wtb } from '../entities/wtb.entity';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { CreateWTBDto } from './dto/create-wtb.dto';
import { UpdateWTBDto } from './dto/update-wtb.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('wtb')
@Controller('wtb')
export class WtbController {
    constructor(private readonly wtbService: WtbService) {}

    @Roles('admin')
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all wtb items, only admin' })
    async findAll(): Promise<Wtb[]> {
        return await this.wtbService.findAll();
    }

    @Get('user')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all wtb items for a user' })
    async findByUser(@Request() req) {
        const userId = req.user.id;
        const items = await this.wtbService.findByUser(userId);

        return items.map((item) => ({
            id: item.id,
            size: item.size,
            quantity: item.quantity,
            product: {
                name: item.product.name,
                sku: item.product.sku,
                description: item.product.description,
                image_link: item.product.image_link,
            },
        }));
    }

    @UseGuards(VerifiedUserGuard)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new wtb item for a user' })
    async create(@Body() createWTBDto: CreateWTBDto, @Req() req) {
        return await this.wtbService.create(createWTBDto, req.user.id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a wtb item for a user' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateWTBDto: UpdateWTBDto,
        @GetUser() user: { id: number },
    ) {
        return await this.wtbService.update(id, updateWTBDto, user.id);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a wtb item for a user' })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return await this.wtbService.delete(id, user.id);
    }

    @Roles('admin')
    @Get('admin/get-top-10-items')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get top 10 most popular items' })
    async getTopProducts() {
        return await this.wtbService.topProducts();
    }
}
