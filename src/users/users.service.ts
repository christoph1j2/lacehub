import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    //* get user by id, won't be needed in production
    async findOneById(id: number): Promise<User> {
        return await this.usersRepository.findOne({ where: { id } });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email } });
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
}
