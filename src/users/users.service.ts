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

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    //* get user by id, won't be needed in production
    async findOneById(id: number): Promise<User> {
        return await this.usersRepository.findOne({ where: { id } });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    async findOneByEmailWithRole(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { email },
            relations: ['role'],
        });
    }

    async findOne(username: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { username } });
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async delete(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    //* according to the dto, should update user name and email, will have to consult with frontend
    async update(userId: number, updateUserDto: UpdateUserDto) {
        await this.usersRepository.update(userId, updateUserDto);
        return this.findOneById(userId);
    }

    // Method for searching users through text field
    async searchUsers(query: string, limit = 10, offset = 0): Promise<User[]> {
        /**On the frontend:
         * Pass limit and offset as query parameters.
         * Use the currentPage and totalPages from the response for pagination UI.
         */
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

    async banUser(userId: number, banDurationInDays: number): Promise<User> {
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
        const banExpirationDate = new Date();
        user.ban_expiration.setDate(
            banExpirationDate.getDate() + banDurationInDays,
        );

        return await this.usersRepository.save(user);
    }

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

    async promoteUser(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.role_id = 1; //? 1 is the ID of the 'admin' role

        return await this.usersRepository.save(user);
    }

    async demoteUser(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.role_id = 2; //? 2 is the ID of the 'user' role

        return await this.usersRepository.save(user);
    }

    async getTotalUserCount(): Promise<number> {
        return await this.usersRepository.count();
    }

    /**
     * Gets user registration counts per month for a date range
     * Useful for generating graphs showing user growth over time
     *
     * @param startDate - Beginning of date range (defaults to start of current month)
     * @param endDate - End of date range (defaults to end of current month)
     * @returns Object with monthly registration counts
     */
    async getMonthlyRegisterCount(
        startDate?: Date,
        endDate?: Date,
    ): Promise<any> {
        const today = new Date();
        const start =
            startDate || new Date(today.getFullYear(), today.getMonth(), 1);
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
            const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            monthLabels.push(monthStr);
            monthCounts[monthStr] = 0;

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        users.forEach((user) => {
            const registrationDate = new Date(user.created_at);
            const monthStr = `${registrationDate.getFullYear()}-${String(registrationDate.getMonth() + 1).padStart(2, '0')}`;
            if (monthCounts[monthStr] !== undefined) {
                monthCounts[monthStr]++;
            }
        });

        result.labels = monthLabels;
        result.counts = monthLabels.map((month) => monthCounts[month]);

        return result;
    }
}
