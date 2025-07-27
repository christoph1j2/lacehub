/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
    };

    const mockAuthService = {
        login: jest.fn(),
        register: jest.fn(),
        verifyEmailToken: jest.fn(),
        requestPasswordReset: jest.fn(),
        resetPassword: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ThrottlerModule.forRoot({
                    throttlers: [
                        {
                            name: 'default',
                            ttl: 60000, // 60 seconds
                            limit: 60, // 60 requests per minute (1 req/sec average)
                        },
                        {
                            name: 'auth',
                            ttl: 300000, // 5 minutes
                            limit: 10, // 10 login attempts per 5 minutes
                        },
                        {
                            name: 'match',
                            ttl: 120000, // 2 minutes
                            limit: 1, // 1 match request per 2 minutes
                        },
                    ],
                }),
            ],
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: UsersService,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const loginResult = {
                user: { id: 1, email: 'test@example.com' },
                message: 'Login successful',
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                cookie: {
                    name: 'refreshToken',
                    options: {},
                },
            };

            mockAuthService.login.mockResolvedValue(loginResult);

            const res = { cookie: jest.fn() };

            const result = await controller.login(loginUserDto, res);

            expect(authService.login).toHaveBeenCalledWith(loginUserDto);
            expect(res.cookie).toHaveBeenCalledWith(
                loginResult.cookie.name,
                loginResult.refreshToken,
                loginResult.cookie.options,
            );
            expect(result).toEqual({
                message: loginResult.message,
                user: loginResult.user,
                accessToken: loginResult.accessToken,
            });
        });
        it('should handle throttled login requests', async () => {
            // Mock a throttled request scenario
            const loginUserDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            // Simulate throttler rejection
            mockAuthService.login.mockRejectedValue(
                new BadRequestException('Too many requests'),
            );

            const res = { cookie: jest.fn() };

            await expect(controller.login(loginUserDto, res)).rejects.toThrow(
                BadRequestException,
            );

            expect(res.cookie).not.toHaveBeenCalled();
        });
        it('should handle invalid credentials', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            mockAuthService.login.mockRejectedValue(
                new BadRequestException('Invalid credentials'),
            );

            await expect(
                controller.login(loginUserDto, { cookie: jest.fn() }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('register', () => {
        it('should register user successfully', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                password: 'password123',
                username: 'TestUser',
            };

            const registerResult = {
                user: {
                    id: 1,
                    email: 'test@example.com',
                    username: 'TestUser',
                },
                message: 'Registration successful',
            };

            mockAuthService.register.mockResolvedValue(registerResult);

            const result = await controller.register(createUserDto);

            expect(authService.register).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual(registerResult);
        });

        it('should handle duplicate email registration', async () => {
            const createUserDto: CreateUserDto = {
                email: 'existing@example.com',
                password: 'password123',
                username: 'TestUser',
            };

            mockAuthService.register.mockRejectedValue(
                new BadRequestException('Email already exists'),
            );

            await expect(controller.register(createUserDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully', async () => {
            const token = 'valid-token';
            mockAuthService.verifyEmailToken.mockResolvedValue({ id: 1 });

            const result = await controller.verifyEmail(token);

            expect(authService.verifyEmailToken).toHaveBeenCalledWith(token);
            expect(result).toEqual({
                message: 'Email verified successfully!',
            });
        });

        it('should handle invalid token', async () => {
            const token = 'invalid-token';
            mockAuthService.verifyEmailToken.mockRejectedValue(
                new BadRequestException('Invalid token'),
            );

            await expect(controller.verifyEmail(token)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('requestPasswordReset', () => {
        it('should handle password reset request', async () => {
            const email = 'test@example.com';
            await controller.requestPasswordReset(email);
            expect(authService.requestPasswordReset).toHaveBeenCalledWith(
                email,
            );
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            const token = 'valid-token';
            const newPassword = 'newPassword123';
            mockAuthService.resetPassword.mockResolvedValue({ id: 1 });

            const result = await controller.resetPassword(token, newPassword);

            expect(authService.resetPassword).toHaveBeenCalledWith(
                token,
                newPassword,
            );
            expect(result).toEqual({
                message: 'Password reset successfully',
            });
        });

        it('should handle invalid reset token', async () => {
            const token = 'invalid-token';
            const newPassword = 'newPassword123';
            mockAuthService.resetPassword.mockResolvedValue(null);

            await expect(
                controller.resetPassword(token, newPassword),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('refreshToken', () => {
        it('should refresh access token successfully', async () => {
            const refreshToken = 'valid-refresh-token';
            const req = { cookies: { refreshToken } };
            const newAccessToken = 'new-access-token';

            mockAuthService.refreshToken.mockResolvedValue(newAccessToken);

            const result = await controller.refreshToken(req);

            expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
            expect(result).toEqual({ accessToken: newAccessToken });
        });

        it('should handle missing refresh token', async () => {
            const req = { cookies: {} };

            await expect(controller.refreshToken(req)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const req = { user: { sub: 1 } };
            const res = {
                clearCookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await controller.logout(req, res);

            expect(authService.logout).toHaveBeenCalledWith(1);
            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Logged out successfully',
            });
        });
    });
});
