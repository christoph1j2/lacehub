import {
    BadRequestException,
    ConflictException,
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
import { MoreThan, Repository, Not, IsNull } from 'typeorm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
        readonly jwtService: JwtService,
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

    async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
        const user = await this.usersService.findOneByEmailWithRole(email);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role.role_name,
            verified: user.verified,
            refreshToken: this.jwtService.sign(
                { sub: user.id },
                { expiresIn: '7d' },
            ),
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '1d',
        });
        const refreshToken = payload.refreshToken;

        // save refresh token in db
        user.refreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.save(user);

        return {
            message: 'Login successful',
            user,
            accessToken,
            refreshToken,
            cookie: {
                name: 'refreshToken',
                value: refreshToken,
                options: {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'development',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                },
            },
        };
    }

    async register(createUserDto: CreateUserDto): Promise<User> {
        const { username, email, password } = createUserDto;

        // Validate required fields
        if (!username || !email || !password) {
            throw new BadRequestException('Missing required fields');
        }

        // validation for email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestException('Invalid email format');
        }

        // Check if username or email already exists
        const existingUser = await this.usersService.findOne(username);
        const existingEmail =
            await this.usersService.findOneByEmailWithRole(email);
        if (existingUser || existingEmail) {
            throw new ConflictException('Username or email already exists');
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
        //const verificationUrl = `http://localhost:3000/auth/verify-email?token=${user.verificationToken}`;
        const verificationUrl = `https://api.lacehub.cz/auth/verify-email?token=${user.verificationToken}`;
        console.log(`Verification URL (placeholder): ${verificationUrl}`);

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
        //const resetUrl = `http://localhost:3000/auth/reset-password?token=${user.resetToken}`;
        const resetUrl = `https://api.lacehub.cz/auth/reset-password?token=${user.resetToken}`;
        console.log(`Password reset URL (placeholder): ${resetUrl}`);

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

    async refreshToken(refreshToken: string): Promise<string> {
        // Find the user by the refresh token directly
        const user = await this.validateRefreshToken(refreshToken);

        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Create a new access token with user details
        const newAccessToken = this.jwtService.sign(
            {
                username: user.username,
                sub: user.id,
                role: user.role.role_name,
                verified: user.verified,
            },
            { expiresIn: '15m' },
        );

        return newAccessToken;
    }

    async logout(userId: number): Promise<void> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (user) {
            user.refreshToken = null;
            await this.usersRepository.save(user);
        }
    }

    async validateRefreshToken(refreshToken: string): Promise<User | null> {
        // Only fetch users who have a non-null refreshToken
        const users = await this.usersRepository.find({
            where: {
                refreshToken: Not(IsNull()),
            },
        });

        for (const user of users) {
            if (
                user.refreshToken &&
                (await bcrypt.compare(refreshToken, user.refreshToken))
            ) {
                return user;
            }
        }
        return null;
    }
}
