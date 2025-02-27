/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
//import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';

const mockUsersService = {
    findOneByEmailWithRole: jest.fn(),
    findOne: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(),
};

const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
};

const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: MailService, useValue: mockMailService },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks(); //clears mock history
    });

    //* 1. validateUser method test
    describe('validateUser', () => {
        it('should return user if credentials are valid', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedPassword',
            };
            mockUsersService.findOne.mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

            const result = await service.validateUser('testuser', 'password');
            expect(result).toEqual(user);
            expect(mockUsersService.findOne).toHaveBeenCalledWith('testuser');
        });

        it('should throw UnathorizedException if credentials are invalid', async () => {
            mockUsersService.findOne.mockResolvedValue(null);
            await expect(
                service.validateUser('testuser', 'password'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    //* 2. login method test
    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            const loginUserDto = {
                email: 'test@example.com',
                password: 'password',
            };
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedPassword',
                role: { role_name: 'user' },
                verified: true,
            };

            mockUsersService.findOneByEmailWithRole.mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

            // DEBUGGING: Log the actual sign method calls
            const signMock = mockJwtService.sign.mockImplementation(
                (payload, options) => {
                    console.log('Sign method called with:', {
                        payload,
                        options,
                    });

                    // Explicitly return different tokens based on the options
                    if (options?.expiresIn === '1d') {
                        return 'mockAccessToken';
                    }
                    if (options?.expiresIn === '7d') {
                        return 'mockRefreshToken';
                    }
                    return 'unknownToken';
                },
            );

            // Mock bcrypt hash for refresh token
            jest.spyOn(bcrypt, 'hash').mockImplementation(
                async () =>
                    '$2b$10$J/9j2/rQJUrEkwky8nLKOeZLSvbMES0CdlzyjGJfIfX.KhrshW2AS',
            );

            // Mock repository save for storing refresh token
            mockUserRepository.save.mockResolvedValue({
                ...user,
                refreshToken:
                    '$2b$10$J/9j2/rQJUrEkwky8nLKOeZLSvbMES0CdlzyjGJfIfX.KhrshW2AS',
            });

            const result = await service.login(loginUserDto);

            console.log('LOGIN RESULT:', JSON.stringify(result, null, 2));

            // Validate core response structure
            // Precise expectation matching the actual return structure
            expect(result).toEqual({
                message: 'Login successful',
                user: expect.objectContaining({
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    role: { role_name: 'user' },
                    verified: true,
                    refreshToken: expect.any(String),
                }),
                accessToken: 'mockAccessToken',
                refreshToken: 'mockRefreshToken',
                cookie: {
                    name: 'refreshToken',
                    value: 'mockRefreshToken',
                    options: {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'development',
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    },
                },
            });

            // Verify method calls
            expect(
                mockUsersService.findOneByEmailWithRole,
            ).toHaveBeenCalledWith(loginUserDto.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(
                loginUserDto.password,
                user.password_hash,
            );
        });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
        const loginUserDto = {
            email: 'nonexistent@example.com',
            password: 'password',
        };

        mockUsersService.findOneByEmailWithRole.mockResolvedValue(null);

        await expect(service.login(loginUserDto)).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
        const loginUserDto = {
            email: 'test@example.com',
            password: 'wrongpassword',
        };
        const user = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password_hash: 'hashedPassword',
            role: { role_name: 'user' },
            verified: true,
        };

        mockUsersService.findOneByEmailWithRole.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

        await expect(service.login(loginUserDto)).rejects.toThrow(
            UnauthorizedException,
        );
    });

    //* 3. register method test
    describe('register', () => {
        const createUserDto: CreateUserDto = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password',
        };

        it('should create a user and return it', async () => {
            // Ensure both username and email checks return null
            mockUsersService.findOne.mockResolvedValue(null);
            mockUsersService.findOneByEmailWithRole.mockResolvedValue(null);

            const user = {
                id: 1,
                ...createUserDto,
                password_hash: 'hashedPassword',
                verificationToken: 'token',
            };

            mockUserRepository.create.mockReturnValue(user);
            mockUserRepository.save.mockResolvedValue(user);

            jest.spyOn(bcrypt, 'hash').mockImplementation(
                async () => 'hashedPassword',
            );

            const result = await service.register(createUserDto);
            expect(result).toEqual(user);
            expect(mockUserRepository.create).toHaveBeenCalledWith(
                createUserDto,
            );
            expect(mockUserRepository.save).toHaveBeenCalledWith(user);
        });

        it('should throw an error if username already exists', async () => {
            mockUsersService.findOne.mockResolvedValue({
                id: 1,
                ...createUserDto,
            }); // Simulate existing user

            await expect(service.register(createUserDto)).rejects.toThrow(
                'Username or email already exists',
            );

            expect(mockUsersService.findOne).toHaveBeenCalledWith(
                createUserDto.username,
            );
        });

        it('should throw an error if email already exists', async () => {
            mockUsersService.findOneByEmailWithRole.mockResolvedValue({
                id: 1,
                ...createUserDto,
            }); // Simulate existing email

            await expect(service.register(createUserDto)).rejects.toThrow(
                'Username or email already exists',
            );

            expect(
                mockUsersService.findOneByEmailWithRole,
            ).toHaveBeenCalledWith(createUserDto.email);
        });

        it('should throw an error if any required field is missing', async () => {
            const invalidCreateUserDto = {
                username: 'newuser',
                email: '',
                password: '',
            }; // Empty fields

            await expect(
                service.register(invalidCreateUserDto as CreateUserDto),
            ).rejects.toThrow('Please enter all fields');
        });

        it('should throw an error if email format is invalid', async () => {
            const invalidEmailDto = {
                ...createUserDto,
                email: 'invalid-email',
            }; // Invalid email format

            await expect(service.register(invalidEmailDto)).rejects.toThrow(
                'Invalid email format',
            );
        });
    });

    //* 4. verifyEmailToken method test
    describe('verifyEmailToken', () => {
        it('should verify user email if token is valid', async () => {
            const user = { id: 1, verified: false, verificationToken: 'token' };
            mockUserRepository.findOne.mockResolvedValue(user);
            mockUserRepository.save.mockResolvedValue({
                ...user,
                verified: true,
                verificationToken: null,
            });

            const result = await service.verifyEmailToken('token');
            expect(result).toEqual({
                ...user,
                verified: true,
                verificationToken: null,
            });
        });

        it('should return null if token is invalid', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const result = await service.verifyEmailToken('invalidToken');
            expect(result).toBeNull();
        });
    });

    //* 5. resetPassword method test
    describe('resetPassword', () => {
        it('should reset the user password if the reset token is valid', async () => {
            const user = {
                id: 1,
                resetToken: 'token',
                resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
            };
            mockUserRepository.findOne.mockResolvedValue(user);
            jest.spyOn(bcrypt, 'hash').mockImplementation(
                async () => 'newHashedPassword',
            );
            mockUserRepository.save.mockResolvedValue({
                ...user,
                password_hash: 'newHashedPassword',
                resetToken: null,
                resetTokenExpires: null,
            });

            const result = await service.resetPassword('token', 'newPassword');
            expect(result).toEqual({
                ...user,
                password_hash: 'newHashedPassword',
                resetToken: null,
                resetTokenExpires: null,
            });
        });

        it('should return null if the reset token is invalid or expired', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const result = await service.resetPassword(
                'invalidToken',
                'newPassword',
            );
            expect(result).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear refresh token for the user', async () => {
            const userId = 1;
            const user = {
                id: userId,
                refreshToken: 'someToken',
            };

            mockUserRepository.findOne.mockResolvedValue(user);
            mockUserRepository.save.mockResolvedValue({
                ...user,
                refreshToken: null,
            });

            await service.logout(userId);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(mockUserRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    refreshToken: null,
                }),
            );
        });
    });

    describe('refreshToken', () => {
        it('should generate a new access token with valid refresh token', async () => {
            const refreshToken = 'validRefreshToken';
            const user = {
                id: 1,
                username: 'testuser',
                role: { role_name: 'user' },
                verified: true,
            };

            jest.spyOn(service, 'validateRefreshToken').mockResolvedValue(
                user as User,
            );

            mockJwtService.sign.mockReturnValue('newAccessToken');

            const result = await service.refreshToken(refreshToken);

            expect(result).toBe('newAccessToken');
            expect(mockJwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    username: user.username,
                    sub: user.id,
                    role: user.role.role_name,
                    verified: user.verified,
                }),
                { expiresIn: '15m' },
            );
        });

        it('should throw UnauthorizedException for invalid refresh token', async () => {
            const invalidRefreshToken = 'invalidToken';

            jest.spyOn(service, 'validateRefreshToken').mockResolvedValue(null);

            await expect(
                service.refreshToken(invalidRefreshToken),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
