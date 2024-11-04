import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return await this.usersService.findOne(id);
    }

    @Get()
    async findAll() {
        return await this.usersService.findAll();
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        return await this.usersService.delete(id);
    }
}
