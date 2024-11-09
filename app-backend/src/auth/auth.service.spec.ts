import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

const mockUsersService = {
  findOneByEmail: jest.fn(),
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

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
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
    it('should return an access token if credentials are valid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockJwtService.sign.mockReturnValue('accessToken');

      const result = await service.login(loginUserDto);
      expect(result).toEqual({ accessToken: 'accessToken' });
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  //* 3. register method test
  describe('register', () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password',
    };

    it('should create a user and return it', async () => {
      const user = {
        id: 1,
        ...createUserDto,
        password_hash: 'hashedPassword',
        verificationToken: 'token',
      };
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashedPassword');

      const result = await service.register(createUserDto);
      expect(result).toEqual(user);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw an error if username already exists', async () => {
      mockUsersService.findOne.mockResolvedValue({
        id: 1,
        ...createUserDto,
      });
      await expect(service.register(createUserDto)).rejects.toThrow(
        'Username or email already exists',
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        createUserDto.username,
      );
    });

    it('should throw an error if email already exists', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 1,
        ...createUserDto,
      });
      await expect(service.register(createUserDto)).rejects.toThrow(
        'Username or email already exists',
      );
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
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
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'newHashedPassword');
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
      const result = await service.resetPassword('invalidToken', 'newPassword');
      expect(result).toBeNull();
    });
  });
});
