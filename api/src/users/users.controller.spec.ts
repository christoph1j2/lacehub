import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExecutionContext } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

const mockUsersService = {
    findOneById: jest.fn(),
    findOneByEmail: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
};

const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 1 }; // mock auth userid
        return true;
    },
};

const mockCacheManager = {};

const mockUserRepository = {};

describe('UsersController', () => {
    let controller: UsersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard) //override guard with mock
            .useValue(mockJwtAuthGuard)
            .compile();

        controller = module.get<UsersController>(UsersController);
    });

    afterEach(() => {
        jest.clearAllMocks(); //clears mock history
    });

    //* 1. getProfile method test
    describe('getProfile', () => {
        it('should return a user profile for authenticated user', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            };
            mockUsersService.findOneById.mockResolvedValue(user);

            const result = await controller.getProfile({ user: { id: 1 } });
            expect(result).toEqual(user);
            expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
        });
    });

    //* 2. updateProfile method test
    describe('updatePorfile', () => {
        it('should update the profile of authenticated user', async () => {
            const updateUserDto: UpdateUserDto = {
                username: 'updateduser',
                //email: 'updated@example.com',
            };
            const updatedUser = { id: 1, ...updateUserDto };
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await controller.updateProfile(
                { user: { id: 1 } },
                updateUserDto,
            );
            expect(result).toEqual(updatedUser);
            expect(mockUsersService.update).toHaveBeenCalledWith(
                1,
                updateUserDto,
            );
        });
    });

    //* 3. findOneById method test
    describe('findOneById', () => {
        it('should return a user by id', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            };
            mockUsersService.findOneById.mockResolvedValue(user);

            const result = await controller.findOneById(1);
            expect(result).toEqual(user);
            expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
        });
    });

    //* 4. findOneByEmail method test
    describe('findOneByEmail', () => {
        it('should return a user by email', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            };
            mockUsersService.findOneByEmail.mockResolvedValue(user);

            const result = await controller.findOneByEmail('test@example.com');
            expect(result).toEqual(user);
            expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
                'test@example.com',
            );
        });
    });

    //* 5. findOne method test
    describe('findOne', () => {
        it('should return a user by username', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            };
            mockUsersService.findOne.mockResolvedValue(user);

            const result = await controller.findOne('testuser');
            expect(result).toEqual(user);
            expect(mockUsersService.findOne).toHaveBeenCalledWith('testuser');
        });
    });

    //* 6. findAll method test
    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [
                { id: 1, username: 'testuser', email: 'test@example.com' },
            ];
            mockUsersService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();
            expect(result).toEqual(users);
            expect(mockUsersService.findAll).toHaveBeenCalled();
        });
    });

    //* 7. delete method test
    describe('delete', () => {
        it('should delete a user by id', async () => {
            mockUsersService.delete.mockResolvedValue(undefined);

            const mockReq = { user: { id: 1 } };
            const result = await controller.delete(mockReq);
            expect(result).toBeUndefined();
            expect(mockUsersService.delete).toHaveBeenCalledWith(1);
        });
    });
});
