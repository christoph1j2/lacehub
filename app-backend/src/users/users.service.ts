import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { username, email, password } = createUserDto;

        //*hash
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            username,
            email,
            password_hash: hashedPassword,
            role_id: 2,
        });

        return await this.usersRepository.save(user);
    }

    async findOne(id: number): Promise<User> {
        return await this.usersRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async delete(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }
}
