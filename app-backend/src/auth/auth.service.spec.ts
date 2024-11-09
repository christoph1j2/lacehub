import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if valid credentials', async () => {
      const user = new User();
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      expect(await service.validateUser('testuser', 'password')).toBe(user);
    });

    it('should throw UnauthorizedException if invalid credentials', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(service.validateUser('testuser', 'password')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access token if valid credentials', async () => {
      const user = new User();
      user.email = 'test@example.com';
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      expect(await service.login({ email: 'test@example.com', password: 'password' })).toEqual({ accessToken: 'token' });
    });

    it('should throw UnauthorizedException if invalid credentials', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });
  });

  // Add more tests for other functions like register, verifyEmailToken, requestPasswordReset, and resetPassword
});
