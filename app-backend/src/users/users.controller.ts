import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    //* get user by id, won't be needed in production
    @Get(':id')
    async findOneById(@Param('id') id: number) {
        return await this.usersService.findOneById(id);
    }

    @Get(':email')
    async findOneByEmail(@Param('email') email: string) {
        return await this.usersService.findOneByEmail(email);
    }

    @Get(':username')
    async findOne(@Param('username') username: string) {
        return await this.usersService.findOne(username);
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
