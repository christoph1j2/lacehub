import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
};

const mockCacheManager = {};

describe('UsersService', () => {
    let service: UsersService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks(); //clears mock history
    });

    //* 1. findOneById method test
    describe('findOneById', () => {
        it('should return a user by id', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            } as User;
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.findOneById(1);
            expect(result).toEqual(user);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('should return null if user is not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.findOneById(999);
            expect(result).toBeNull();
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: 999 },
            });
        });
    });

    //* 2. findOneByEmail method test
    describe('findOneByEmail', () => {
        it('should return a user by email', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            } as User;
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.findOneByEmail('test@example.com');
            expect(result).toEqual(user);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });

        it('should return null if user is not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.findOneByEmail('notfound@example.com');
            expect(result).toBeNull();
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'notfound@example.com' },
            });
        });
    });

    //* 3. findOne method test
    describe('findOne', () => {
        it('should return a user by username', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            } as User;
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.findOne('testuser');
            expect(result).toEqual(user);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
        });

        it('should return null if user is not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.findOne('notfounduser');
            expect(result).toBeNull();
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { username: 'notfounduser' },
            });
        });
    });

    //* 4. findAll method test
    describe('findall', () => {
        it('should return an array of users', async () => {
            const users = [
                {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                } as User,
            ];
            mockUserRepository.find.mockResolvedValue(users);

            const result = await service.findAll();
            expect(result).toEqual(users);
            expect(mockUserRepository.find).toHaveBeenCalled();
        });
    });

    //* 5. delete method test
    describe('delete', () => {
        it('should call delete with correct id', async () => {
            mockUserRepository.delete.mockResolvedValue({});

            await service.delete(1);
            expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
        });
    });

    //* 6. update method test
    describe('update', () => {
        it('should update user data', async () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
            } as User;
            const updateUserDto = {
                username: 'updateduser',
                email: 'updated@example.com',
            };

            mockUserRepository.update.mockResolvedValue({});
            mockUserRepository.findOne.mockResolvedValue({
                ...user,
                ...updateUserDto,
            });

            const result = await service.update(1, updateUserDto);
            expect(result).toEqual({ ...user, ...updateUserDto });
            expect(mockUserRepository.update).toHaveBeenCalledWith(
                1,
                updateUserDto,
            );
        });
    });
});
