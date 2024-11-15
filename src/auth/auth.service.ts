import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { randomBytes } from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async validateUser(
        username: string,
        password: string,
    ): Promise<User | null> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(password, user.password_hash))) {
            return user;
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
        const { email, password } = loginUserDto;
        const user = await this.usersService.findOneByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role_id,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }

    async register(createUserDto: CreateUserDto): Promise<User> {
        const { username, email, password } = createUserDto;

        // Validate required fields
        if (!username || !email || !password) {
            throw new Error('Please enter all fields');
        }

        // validation for email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Check if username or email already exists
        const existingUser = await this.usersService.findOne(username);
        const existingEmail = await this.usersService.findOneByEmail(email);
        if (existingUser || existingEmail) {
            throw new Error('Username or email already exists');
        }

        // Proceed with creating the user
        const user = this.usersRepository.create(createUserDto);
        user.verificationToken = randomBytes(32).toString('hex');
        user.password_hash = await bcrypt.hash(password, 10);

        await this.usersRepository.save(user);
        await this.sendVerificationEmail(user);
        return user;
    }

    async sendVerificationEmail(user: User) {
        // TODO: send email, in prod use email service
        const verificationUrl = `http://localhost:3000/auth/verify-email?token=${user.verificationToken}`;
        console.log(`Verification URL (placeholder): ${verificationUrl}`);
        //* To be replaced by SMTP sending logic

        await this.mailService.sendVerificationEmail(
            user.email,
            user.verificationToken,
        );
    }

    async verifyEmailToken(token: string): Promise<User | null> {
        const user = await this.usersRepository.findOne({
            where: { verificationToken: token },
        });
        if (!user) return null;

        user.verified = true;
        user.verificationToken = null;
        await this.usersRepository.save(user);
        return user;
    }

    async requestPasswordReset(email: string): Promise<void> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) throw new NotFoundException('User not found');

        // Generate reset token
        user.resetToken = randomBytes(32).toString('hex');
        user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await this.usersRepository.save(user);

        await this.sendPasswordResetEmail(user); // 1 hour
    }

    async sendPasswordResetEmail(user: User) {
        // TODO: send email, in prod use email service
        const resetUrl = `http://localhost:3000/auth/reset-password?token=${user.resetToken}`;
        console.log(`Password reset URL (placeholder): ${resetUrl}`);
        //* To be replaced by SMTP sending logic

        await this.mailService.sendPasswordResetEmail(
            user.email,
            user.resetToken,
        );
    }

    async resetPassword(token: string, newPassword: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: {
                resetToken: token,
                resetTokenExpires: MoreThan(new Date()),
            },
        });
        if (!user) return null;

        user.password_hash = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await this.usersRepository.save(user);
        return user;
    }
}
