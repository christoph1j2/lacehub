import {
    Body,
    Controller,
    Post,
    Get,
    BadRequestException,
    Query,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Public()
    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Res({ passthrough: true }) res,
    ) {
        //return await this.authService.login(loginUserDto);
        const loginResult = await this.authService.login(loginUserDto);

        // Explicitly set the cookie
        res.cookie(
            loginResult.cookie.name,
            loginResult.refreshToken,
            loginResult.cookie.options,
        );

        return {
            message: loginResult.message,
            user: loginResult.user,
            accessToken: loginResult.accessToken,
        };
    }

    @Public()
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto);
    }

    @Public()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        const user = await this.authService.verifyEmailToken(token);
        if (!user) {
            throw new BadRequestException('Invalid token');
        }

        return { message: 'Email verified successfully' };
    }

    @Public()
    @Post('request-password-reset')
    async requestPasswordReset(@Body('email') email: string) {
        await this.authService.requestPasswordReset(email);
        return { message: 'Password reset link sent' };
    }

    @Public()
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

    @Public()
    @Post('refresh-token')
    async refreshToken(@Req() req) {
        console.log('Cookies:', req.cookies);
        console.log('Headers:', req.headers);

        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const newAccessToken =
            await this.authService.refreshToken(refreshToken);
        return { accessToken: newAccessToken };
    }

    @Post('logout')
    async logout(@Req() req, @Res() res) {
        const userId = req.user.sub;
        await this.authService.logout(userId);
        res.clearCookie('refreshToken');
        console.log(req.user);
        console.log(req.refreshToken);
        //console.log(this.authService.jwtService.decode(req.accessToken));
        res.status(200).json({ message: 'Logged out successfully' }); // Ensure this matches the test
    }
}
