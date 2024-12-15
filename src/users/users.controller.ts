import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    UseGuards,
    Request,
    Patch,
    ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get user profile, use for displaying personal profile',
    })
    @ApiResponse({ status: 200, description: 'User profile retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getProfile(@Request() req) {
        const userId = req.user.id;
        return this.usersService.findOneById(userId);
    }

    //* according to the dto, should update user name and email, will have to consult with frontend
    @UseGuards(VerifiedUserGuard)
    @Patch('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'User profile updated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req.user.id, updateUserDto);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({ status: 200, description: 'User retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findOneById(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.findOneById(id);
    }

    @Get(':email')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by email' })
    @ApiResponse({ status: 200, description: 'User retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findOneByEmail(@Param('email') email: string) {
        return await this.usersService.findOneByEmail(email);
    }

    @Get(':username')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by username' })
    @ApiResponse({ status: 200, description: 'User retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findOne(@Param('username') username: string) {
        return await this.usersService.findOne(username);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll() {
        return await this.usersService.findAll();
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete users own profile' })
    @ApiResponse({ status: 200, description: 'User deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async delete(@Request() req) {
        const userId = req.user.id;
        return await this.usersService.delete(userId);
    }
}
