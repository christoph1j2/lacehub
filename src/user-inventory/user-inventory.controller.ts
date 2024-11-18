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
} from '@nestjs/common';
import { UserInventoryService } from './user-inventory.service';
import { UserInventory } from '../entities/userInventory.entity';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('user-inventory')
export class UserInventoryController {
    constructor(private readonly userInventoryService: UserInventoryService) {}

    @Roles('admin')
    @Get()
    async findAll(): Promise<UserInventory[]> {
        return await this.userInventoryService.findAll();
    }

    @Get('user')
    async findByUser(@Request() req) {
        const userId = req.user.id;
        return await this.userInventoryService.findByUser(userId);
    }

    @Post()
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
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: { id: number },
    ) {
        return await this.userInventoryService.delete(id, user.id);
    }
}
