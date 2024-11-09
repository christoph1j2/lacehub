import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let usersService: UsersService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let jwtService: JwtService;

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
    };

    const mockUsersService = {
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    //* 1. login method test
    describe('login', () => {
        it('should login user successfully', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const expectedResult = {
                access_token: 'mock-jwt-token',
                user: {
                    id: 1,
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            mockAuthService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(loginUserDto);

            expect(authService.login).toHaveBeenCalledWith(loginUserDto);
            expect(result).toEqual(expectedResult);
        });

        it('should handle invalid credentials', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            mockAuthService.login.mockRejectedValue(
                new BadRequestException('Invalid credentials'),
            );

            await expect(controller.login(loginUserDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    //* 2. register method test
    describe('register', () => {
        it('should register user successfully', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                password: 'password123',
                username: 'Test User',
            };

            const expectedResult = {
                access_token: 'mock-jwt-token',
                user: {
                    id: 1,
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            mockAuthService.register.mockResolvedValue(expectedResult);

            const result = await controller.register(createUserDto);

            expect(authService.register).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual(expectedResult);
        });

        it('should handle duplicate email registration', async () => {
            const createUserDto: CreateUserDto = {
                email: 'existing@example.com',
                password: 'password123',
                username: 'Test User',
            };

            mockAuthService.register.mockRejectedValue(
                new BadRequestException('Email already exists'),
            );

            await expect(controller.register(createUserDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    // Placeholder tests for email functionality
    describe('email-dependent functionality', () => {
        //* 3. verifyEmail method test
        describe('verifyEmail', () => {
            it('should verify email successfully', async () => {
                const token = 'valid-token';
                mockAuthService.verifyEmailToken.mockResolvedValue({ id: 1 });

                const result = await controller.verifyEmail(token);

                expect(authService.verifyEmailToken).toHaveBeenCalledWith(
                    token,
                );
                expect(result).toEqual({
                    message: 'Email verified successfully',
                });
            });

            it('should handle invalid token', async () => {
                const token = 'invalid-token';
                mockAuthService.verifyEmailToken.mockResolvedValue(null);

                await expect(controller.verifyEmail(token)).rejects.toThrow(
                    BadRequestException,
                );
            });
        });

        //* 4. requestPasswordReset method test
        describe('requestPasswordReset', () => {
            it('should handle password reset request', async () => {
                const email = 'test@example.com';
                await controller.requestPasswordReset(email);
                expect(authService.requestPasswordReset).toHaveBeenCalledWith(
                    email,
                );
            });
        });

        //* 5. resetPassword method test
        describe('resetPassword', () => {
            it('should reset password successfully', async () => {
                const token = 'valid-token';
                const newPassword = 'newPassword123';
                mockAuthService.resetPassword.mockResolvedValue({ id: 1 });

                const result = await controller.resetPassword(
                    token,
                    newPassword,
                );

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
    });
});
