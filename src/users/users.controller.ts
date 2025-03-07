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
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
    @Get('/admin/active-user-count')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get active user count' })
    async getActiveUserCount() {
        return await this.usersService.getActiveUserCount();
    }

    @Roles('admin')
    @Get('/admin/active-users')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get active users' })
    async getActiveUsers() {
        return await this.usersService.getActiveUsers();
    }

    @Roles('admin')
    @Get('/admin/inactive-user-count')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get inactive user count' })
    async getInactiveUserCount() {
        return await this.usersService.getInactiveUserCount();
    }

    @Roles('admin')
    @Get('/admin/inactive-users')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get inactive users' })
    async getInactiveUsers() {
        return await this.usersService.getInactiveUsers();
    }

    @Roles('admin')
    @Get('/admin/monthly-register')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get monthly registered users' })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date in YYYY-MM-DD format',
    })
    async getMonthlyRegisteredUsers(
        @Query('startDate') startDateStr?: string,
        @Query('endDate') endDateStr?: string,
    ) {
        try {
            const startDate = startDateStr ? new Date(startDateStr) : undefined;
            const endDate = endDateStr ? new Date(endDateStr) : undefined;

            return await this.usersService.getMonthlyRegisterCount(
                startDate,
                endDate,
            );
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get monthly registered users',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Roles('admin')
    @Get('/admin/total-users')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get total users count' })
    async getTotalUsers() {
        try {
            return await this.usersService.getTotalUserCount();
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get total users count',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('profile/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user profile by id' })
    async getProfileById(@Param('id', ParseIntPipe) id: number) {
        const userProfile = await this.usersService.findOneById(id);

        if (!userProfile) {
            throw new NotFoundException('User not found');
        }

        const reviews = userProfile.reviewsAsSeller
            ? userProfile.reviewsAsSeller.map((review) => ({
                  rating: review.rating,
                  review_text: review.review_text,
                  createdAt: review.created_at,
                  reviewer: {
                      username: review.reviewer.username,
                  },
              }))
            : [];

        return {
            username: userProfile.username,
            role: userProfile.role.role_name,
            verification: userProfile.verified,
            memberSince: userProfile.created_at.toISOString().split('T')[0],
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

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete users own profile' })
    async delete(@Request() req) {
        const userId = req.user.id;
        return await this.usersService.delete(userId);
    }

    @Roles('admin')
    @Get('/admin/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a user by id' })
    async findOneById(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.findOneById(id);
    }

    @Roles('admin')
    @Get('/admin/:email')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by email' })
    async findOneByEmail(@Param('email') email: string) {
        return await this.usersService.findOneByEmail(email);
    }

    @Roles('admin')
    @Get('/admin/:username')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by username' })
    async findOne(@Param('username') username: string) {
        return await this.usersService.findOne(username);
    }

    @Roles('admin')
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    async findAll() {
        return await this.usersService.findAll();
    }

    @Roles('admin')
    @Put('/admin/:id/ban')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ban a user' })
    async banUser(
        @Param('id', ParseIntPipe) userId: number,
        @Param('banExpiry') banExpiry: number,
    ): Promise<User> {
        return await this.usersService.banUser(userId, banExpiry);
    }

    @Roles('admin')
    @Put('/admin/:id/unban')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unban a user' })
    async unbanUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
        return await this.usersService.unbanUser(userId);
    }

    @Roles('admin')
    @Put('/admin/:id/promote')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Promote a user to admin' })
    async promoteUser(
        @Param('id', ParseIntPipe) userId: number,
    ): Promise<User> {
        return await this.usersService.promoteUser(userId);
    }

    @Roles('admin')
    @Put('/admin/:id/demote')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Demote a user to user' })
    async demoteUser(@Param('id', ParseIntPipe) userId: number): Promise<User> {
        return await this.usersService.demoteUser(userId);
    }
}
