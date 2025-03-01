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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
    getProfile(@Request() req) {
        const userId = req.user.id;
        return this.usersService.findOneById(userId);
    }

    @Get('profile/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user profile by id' })
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
    updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req.user.id, updateUserDto);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a user by id' })
    async findOneById(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.findOneById(id);
    }

    @Get(':email')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by email' })
    async findOneByEmail(@Param('email') email: string) {
        return await this.usersService.findOneByEmail(email);
    }

    @Get(':username')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by username' })
    async findOne(@Param('username') username: string) {
        return await this.usersService.findOne(username);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    async findAll() {
        return await this.usersService.findAll();
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete users own profile' })
    async delete(@Request() req) {
        const userId = req.user.id;
        return await this.usersService.delete(userId);
    }

    @Get('search')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Search for users by username or email' })
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
    async unbanUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
        return await this.usersService.unbanUser(userId);
    }
}
