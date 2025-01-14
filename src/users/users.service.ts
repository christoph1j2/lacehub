import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
}
