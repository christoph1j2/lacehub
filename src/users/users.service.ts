/* eslint-disable prefer-const */
import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

/**
 * Service responsible for managing user accounts and providing user-related functionality.
 *
 * This service handles user CRUD operations, search functionality, user management
 * (banning, role changes), and analytics about user activities and registrations.
 */
@Injectable()
export class UsersService {
    /**
     * Creates an instance of the UsersService.
     *
     * @param usersRepository - Repository for user entity database operations
     * @param cacheManager - Cache manager for storing and retrieving cached search results
     */
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * Retrieves a user by their ID.
     *
     * @param id - The unique identifier of the user to retrieve
     * @returns Promise resolving to the user entity or undefined if not found
     */
    async findOneById(id: number): Promise<User> {
        return await this.usersRepository.findOne({ where: { id } });
    }

    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address to search for
     * @returns Promise resolving to the user entity or null if not found
     */
    async findOneByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    /**
     * Retrieves a user by their email address, including their role information.
     *
     * @param email - The email address to search for
     * @returns Promise resolving to the user entity with role relation or null if not found
     */
    async findOneByEmailWithRole(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { email },
            relations: ['role'],
        });
    }

    /**
     * Retrieves a user by their username.
     *
     * @param username - The username to search for
     * @returns Promise resolving to the user entity or null if not found
     */
    async findOne(username: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { username } });
    }

    /**
     * Retrieves all users from the database.
     *
     * @returns Promise resolving to an array of all user entities
     */
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    /**
     * Deletes a user from the database.
     *
     * @param id - The unique identifier of the user to delete
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    /**
     * Updates a user's information.
     *
     * @param userId - The unique identifier of the user to update
     * @param updateUserDto - Data transfer object containing the fields to update
     * @returns Promise resolving to the updated user entity
     */
    async update(userId: number, updateUserDto: UpdateUserDto) {
        await this.usersRepository.update(userId, updateUserDto);
        return this.findOneById(userId);
    }

    /**
     * Searches for users by username with pagination and caching support.
     *
     * @param query - The search term to look for in usernames
     * @param limit - Maximum number of results to return (default: 10)
     * @param offset - Number of results to skip for pagination (default: 0)
     * @returns Promise resolving to an array of matching user entities
     *
     * @example
     * * // On the frontend:
     * * // Pass limit and offset as query parameters.
     * * // Use the currentPage and totalPages from the response for pagination UI.
     *
     */
    async searchUsers(query: string, limit = 10, offset = 0): Promise<User[]> {
        const cacheKey = `search:${query}:${limit}:${offset}`;

        // Try to get cached results
        const cachedResults = await this.cacheManager.get<{
            results: User[];
            total: number;
        }>(cacheKey);
        if (cachedResults) {
            return cachedResults.results;
        }

        // If not in cache, fetch from database
        const [results, total] = await this.usersRepository.findAndCount({
            where: [{ username: ILike(`%${query}%`) }],
            take: limit,
            skip: offset,
        });

        // Cache the results for 5 minutes
        const cacheData = { results, total };
        await this.cacheManager.set(cacheKey, cacheData, 300000); // 5 minutes in milliseconds

        return cacheData.results;
    }

    /**
     * Bans a user for a specified duration.
     *
     * @param userId - The unique identifier of the user to ban
     * @param banDurationInDays - The duration of the ban in days
     * @returns Promise resolving to the updated user entity
     * @throws NotFoundException if the user is not found
     * @throws BadRequestException if the user is already banned
     */
    async banUser(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        if (user.is_banned) {
            throw new BadRequestException('User is already banned.');
        }

        user.is_banned = true;
        return await this.usersRepository.save(user);
    }

    /**
     * Removes a ban from a user.
     *
     * @param userId - The unique identifier of the user to unban
     * @returns Promise resolving to the updated user entity
     * @throws NotFoundException if the user is not found
     * @throws BadRequestException if the user is not currently banned
     */
    async unbanUser(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.is_banned) {
            throw new BadRequestException('User is not banned');
        }

        user.is_banned = false;
        user.ban_expiration = null;

        return await this.usersRepository.save(user);
    }

    /**
     * Promotes a user to admin role.
     *
     * @param userId - The unique identifier of the user to promote
     * @returns Promise resolving to the updated user entity
     * @throws NotFoundException if the user is not found
     */
    async promoteUser(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.role_id = 1; // 1 is the ID of the 'admin' role

        return await this.usersRepository.save(user);
    }

    /**
     * Demotes a user to regular user role.
     *
     * @param userId - The unique identifier of the user to demote
     * @returns Promise resolving to the updated user entity
     * @throws NotFoundException if the user is not found
     */
    async demoteUser(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.role_id = 2; // 2 is the ID of the 'user' role

        return await this.usersRepository.save(user);
    }

    /**
     * Gets the total count of users in the system.
     *
     * @returns Promise resolving to the count of all users
     */
    async getTotalUserCount(): Promise<number> {
        return await this.usersRepository.count();
    }

    /**
     * Gets user registration counts per month for a date range.
     * Useful for generating graphs showing user growth over time.
     *
     * @param startDate - Beginning of date range (defaults to start of 11 months ago)
     * @param endDate - End of date range (defaults to end of current month)
     * @returns Object with monthly registration data including labels, counts, and total
     */
    async getMonthlyRegisterCount(
        startDate?: Date,
        endDate?: Date,
    ): Promise<any> {
        const today = new Date();
        const start =
            startDate ||
            new Date(today.getFullYear(), today.getMonth() - 11, 1);
        start.setHours(0, 0, 0, 0);

        const end =
            endDate || new Date(today.getFullYear(), today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);

        const users = await this.usersRepository.find({
            where: {
                created_at: Between(start, end),
            },
        });

        const result = {
            labels: [],
            counts: [],
            totalRegistered: users.length,
        };

        const monthLabels = [];
        const monthCounts = {};

        let currentDate = new Date(start);
        while (currentDate <= end) {
            const monthStr = `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1,
            ).padStart(2, '0')}`;
            monthLabels.push(monthStr);
            monthCounts[monthStr] = 0;

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        users.forEach((user) => {
            const registrationDate = new Date(user.created_at);
            const monthStr = `${registrationDate.getFullYear()}-${String(
                registrationDate.getMonth() + 1,
            ).padStart(2, '0')}`;
            if (monthCounts[monthStr] !== undefined) {
                monthCounts[monthStr]++;
            }
        });

        result.labels = monthLabels;
        result.counts = monthLabels.map((month) => monthCounts[month]);

        return result;
    }

    /**
     * Gets count of users who have logged in within the last 30 days.
     *
     * @returns Promise resolving to the count of active users
     */
    async getActiveUserCount(): Promise<number> {
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);

        return await this.usersRepository.count({
            where: {
                last_login: Between(monthAgo, today),
            },
        });
    }

    /**
     * Gets count of users who have not logged in within the last 30 days.
     *
     * @returns Promise resolving to the count of inactive users
     */
    async getInactiveUserCount(): Promise<number> {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);

        return await this.usersRepository.count({
            where: {
                last_login: Between(new Date(0), monthAgo),
            },
        });
    }

    /**
     * Retrieves all users who have logged in within the last 30 days.
     *
     * @returns Promise resolving to an array of active user entities
     */
    async getActiveUsers(): Promise<User[]> {
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);

        return await this.usersRepository.find({
            where: {
                last_login: Between(monthAgo, today),
            },
        });
    }

    /**
     * Retrieves all users who have not logged in within the last 30 days.
     *
     * @returns Promise resolving to an array of inactive user entities
     */
    async getInactiveUsers(): Promise<User[]> {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);

        return await this.usersRepository.find({
            where: {
                last_login: Between(new Date(0), monthAgo),
            },
        });
    }
}
