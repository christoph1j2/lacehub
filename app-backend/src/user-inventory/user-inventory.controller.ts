import {
    Controller,
    Get,
    UseGuards,
    Request,
    Body,
    Post,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
} from '@nestjs/common';
import { UserInventoryService } from './user-inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { UserInventory } from '../entities/userInventory.entity';
import { CreateUserInventoryDto } from './dto/create-userInventory.dto';
import { UpdateUserInventoryDto } from './dto/update-userInventory.dto';

@Controller('user-inventory')
export class UserInventoryController {
    constructor(private readonly userInventoryService: UserInventoryService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<UserInventory[]> {
        return await this.userInventoryService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('user')
    async findByUser(@Request() req) {
        const userId = req.user.id;
        return await this.userInventoryService.findByUser(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createUserInventoryDto: CreateUserInventoryDto) {
        return await this.userInventoryService.create(createUserInventoryDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserInventoryDto: UpdateUserInventoryDto,
    ) {
        return await this.userInventoryService.update(
            id,
            updateUserInventoryDto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.userInventoryService.delete(id);
    }
}
