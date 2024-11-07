import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(password, user.password_hash))) {
            return user;
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
        const { email, password } = loginUserDto;
        const user = await this.usersService.findOne(email);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { username: user.username, sub: user.id, role: user.role_id };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }
}
