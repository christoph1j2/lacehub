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
import { Wts } from '../entities/wts.entity';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { CreateWTSDto } from './dto/create-wts.dto';
import { UpdateWTSDto } from './dto/update-wts.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('wts')
@Controller('wts')
export class WtsController {
    constructor(private readonly wtsService: WtsService) {}

    @Roles('admin')
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all wts items, admin only' })
    @ApiResponse({ status: 200, description: 'Get all wts items' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async findAll(): Promise<Wts[]> {
        return await this.wtsService.findAll();
    }

    @Get('user')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all wts items for a user' })
    @ApiResponse({ status: 200, description: 'Get all wts items' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async findByUser(@Request() req) {
        const userId = req.user.id;
        const items = await this.wtsService.findByUser(userId);

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
    @ApiOperation({ summary: 'Create a new wts item for a user' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async create(@Body() createWTSDto: CreateWTSDto, @Req() req) {
        return await this.wtsService.create(createWTSDto, req.user.id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a wts item for a user' })
    @ApiResponse({ status: 200, description: 'Updated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateWTSDto: UpdateWTSDto,
        @GetUser() user: { id: number },
    ) {
        return await this.wtsService.update(id, updateWTSDto, user.id);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a wts item for a user' })
    @ApiResponse({ status: 200, description: 'Deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return await this.wtsService.delete(id, user.id);
    }
}
