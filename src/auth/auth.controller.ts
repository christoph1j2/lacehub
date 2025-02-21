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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Public()
    @Post('login')
    @ApiOperation({
        summary: 'Login user, returns access and refresh tokens, sets cookie',
    })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
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
    @ApiOperation({
        summary: 'Register user, requires username, email, and password',
    })
    @ApiResponse({ status: 200, description: 'Registration successful' })
    @ApiResponse({
        status: 401,
        description: 'Username or email already exists',
    })
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto);
    }

    @Public()
    @Get('verify-email')
    @ApiOperation({
        summary: 'Verify email, requires token (link sent to email)',
    })
    @ApiResponse({ status: 200, description: 'Email verified successfully' })
    @ApiResponse({ status: 400, description: 'Invalid token' })
    async verifyEmail(@Query('token') token: string) {
        const user = await this.authService.verifyEmailToken(token);
        if (!user) {
            throw new BadRequestException('Invalid token');
        }

        return { message: 'Email verified successfully' };
    }

    @Public()
    @Post('request-password-reset')
    @ApiOperation({ summary: 'Request password reset, requires email' })
    @ApiResponse({ status: 200, description: 'Password reset link sent' })
    @ApiResponse({ status: 400, description: 'Invalid email' })
    async requestPasswordReset(@Body('email') email: string) {
        await this.authService.requestPasswordReset(email);
        return { message: 'Password reset link sent' };
    }

    @Public()
    @Post('reset-password')
    @ApiOperation({
        summary:
            'Reset password, requires token (link sent to email) and new password',
    })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiResponse({ status: 400, description: 'Invalid token' })
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
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Access token refreshed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 401, description: 'Refresh token not found' })
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

    @Public()
    @Post('logout')
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Req() req, @Res() res) {
        const userId = req.user.sub;
        await this.authService.logout(userId);
        res.clearCookie('refreshToken');
        console.log(req.user);
        console.log(req.refreshToken);
        //console.log(this.authService.jwtService.decode(req.accessToken));
        res.status(200).json({ message: 'Logged out successfully' });
    }
}
