import { Body, Controller, Delete, Get, Param, Post, UseGuards, Request, Patch, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}


    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        const userId = req.user.id;
        return this.usersService.findOneById(userId);
    }

    //* according to the dto, should update user name and email, will have to consult with frontend
    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req.user.id, updateUserDto);
    }

    //* get user by id, won't be needed in production
    @Get(':id')
    async findOneById(@Param('id', ParseIntPipe) id: number) {
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
