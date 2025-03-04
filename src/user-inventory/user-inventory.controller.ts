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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user-inventory')
@Controller('user-inventory')
export class UserInventoryController {
    constructor(private readonly userInventoryService: UserInventoryService) {}

    @Roles('admin')
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all inventory items, admin only' })
    async findAll(): Promise<UserInventory[]> {
        return await this.userInventoryService.findAll();
    }

    @Get('user')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all inventory items for a user' })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new inventory item for a user' })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an inventory item for a user' })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an inventory item for a user' })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return await this.userInventoryService.delete(id, user.id);
    }

    @Patch(':id/move-to-wtb')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Move an inventory item to the WTB list' })
    async moveToWtb(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
        return await this.userInventoryService.moveToWtb(id, user.id);
    }

    @Patch(':id/move-to-wts')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Move an inventory item to the WTS list' })
    async moveToWts(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return await this.userInventoryService.moveToWts(id, user.id);
    }
}
