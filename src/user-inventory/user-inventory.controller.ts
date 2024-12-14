import {
    Controller,
    Get,
    Request,
    Body,
    Post,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UserInventoryService } from './user-inventory.service';
import { UserInventory } from '../entities/userInventory.entity';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user-inventory')
@Controller('user-inventory')
export class UserInventoryController {
    constructor(private readonly userInventoryService: UserInventoryService) {}

    @Roles('admin')
    @Get()
    @ApiOperation({ summary: 'Get all inventory items' })
    @ApiResponse({ status: 200, description: 'Get all inventory items' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async findAll(): Promise<UserInventory[]> {
        return await this.userInventoryService.findAll();
    }

    @Get('user')
    @ApiOperation({ summary: 'Get all inventory items for a user' })
    @ApiResponse({ status: 200, description: 'Get all inventory items' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async findByUser(@Request() req) {
        const userId = req.user.id;
        const items = await this.userInventoryService.findByUser(userId);

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
    @ApiOperation({ summary: 'Create a new inventory item' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async create(
        @Body() createUserInventoryDto: CreateUserInventoryDto,
        @Req() req,
    ) {
        return await this.userInventoryService.create(
            createUserInventoryDto,
            req.user.id,
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an inventory item' })
    @ApiResponse({ status: 200, description: 'Updated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserInventoryDto: UpdateUserInventoryDto,
        @GetUser() user: { id: number },
    ) {
        return await this.userInventoryService.update(
            id,
            updateUserInventoryDto,
            user.id,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an inventory item' })
    @ApiResponse({ status: 200, description: 'Deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return await this.userInventoryService.delete(id, user.id);
    }
}
