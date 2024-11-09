import {
    Body,
    Controller,
    Post,
    Get,
    BadRequestException,
    Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return await this.authService.login(loginUserDto);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto);
    }

    //@Public()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        const user = await this.authService.verifyEmailToken(token);
        if (!user) {
            throw new BadRequestException('Invalid token');
        }

        return { message: 'Email verified successfully' };
    }

    //@Public()
    @Post('request-password-reset')
    async requestPasswordReset(@Body('email') email: string) {
        await this.authService.requestPasswordReset(email);
        return { message: 'Password reset link sent' };
    }

    @Post('reset-password')
    async resetPassword(
        @Query('token') token: string,
        @Body('newPassword') newPassword: string,
    ) {
        const user = await this.authService.resetPassword(token, newPassword);
        if (!user) {
            throw new BadRequestException('Invalid token');
        }
        return { message: 'Password reset successfully' };
    }
}
