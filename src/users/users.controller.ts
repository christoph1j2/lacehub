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
    NotFoundException,
    Query,
    Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

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

    @Get('profile/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user profile by id' })
    @ApiResponse({ status: 200, description: 'User profile retrieved' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getProfileById(@Param('id', ParseIntPipe) id: number) {
        const userProfile = await this.usersService.findOneById(id);

        if (!userProfile) {
            throw new NotFoundException('User not found');
        }

        const reviews = userProfile.reviewsAsSeller.map((review) => ({
            rating: review.rating,
            review_text: review.review_text,
            createdAt: review.createdAt,
            reviewer: {
                username: review.reviewer.username,
            },
        }));

        return {
            username: userProfile.username,
            role: userProfile.role.role_name,
            verification: userProfile.verified,
            memberSince: userProfile.created_at,
            reviews: reviews,
        };
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

    @Get('search')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Search for users by username or email' })
    @ApiResponse({ status: 200, description: 'Users retrieved' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async searchUsers(
        @Query('query') query: string,
        @Query('limit') limit = 10,
        @Query('offset') offset = 0,
    ): Promise<{ username: string }[]> {
        const users = await this.usersService.searchUsers(query, limit, offset);
        return users.map((user) => ({
            username: user.username,
        }));
    }

    @Roles('admin')
    @Put(':id/ban')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ban a user' })
    @ApiResponse({ status: 200, description: 'User banned' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async banUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body('banExpiry') banExpiry: number,
    ): Promise<User> {
        return await this.usersService.banUser(userId, banExpiry);
    }

    @Roles('admin')
    @Put(':id/unban')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unban a user' })
    @ApiResponse({ status: 200, description: 'User unbanned' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async unbanUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
        return await this.usersService.unbanUser(userId);
    }
}
