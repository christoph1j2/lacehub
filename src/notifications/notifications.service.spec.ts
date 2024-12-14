import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Match } from '../entities/match.entity';

describe('NotificationsService', () => {
    let service: NotificationsService;
    let repository: Repository<Notification>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: getRepositoryToken(Notification),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        repository = module.get<Repository<Notification>>(
            getRepositoryToken(Notification),
        );
    });

    const mockUser: User = {
        id: 1,
        username: '',
        email: '',
        password_hash: '',
        role_id: 0,
        verificationToken: '',
        verified: false,
        created_at: undefined,
        credibility_score: 0,
        is_banned: false,
        ban_expiration: undefined,
        resetToken: '',
        resetTokenExpires: undefined,
        role: new Role(),
        inventory: [],
        wts: [],
        wtb: [],
        reviewsAsReviewer: [],
        reviewsAsSeller: [],
        reportsAsReported: [],
        reportsAsReporter: [],
        matchesAsBuyer: [],
        matchesAsSeller: [],
        refreshToken: '',
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a notification', async () => {
        const notificationData = {
            userId: 1,
            type: 'MATCH',
            message: 'New match found!',
            matchId: 2,
        };

        const mockNotification = {
            id: 1,
            user: mockUser,
            type: 'MATCH',
            message: 'New match found!',
            match: { id: 2 } as Match,
            is_read: false,
            created_at: new Date(),
        };

        jest.spyOn(repository, 'create').mockReturnValue(mockNotification);
        jest.spyOn(repository, 'save').mockResolvedValue(mockNotification);

        const result = await service.create(
            notificationData.userId,
            notificationData.type,
            notificationData.message,
            notificationData.matchId,
        );

        expect(repository.create).toHaveBeenCalledWith({
            user: { id: 1 },
            type: 'MATCH',
            message: 'New match found!',
            is_read: false,
            created_at: expect.any(Date),
            match: { id: 2 },
        });
        expect(repository.save).toHaveBeenCalledWith(mockNotification);
        expect(result).toEqual(mockNotification);
    });

    it('should find all notifications for a user', async () => {
        const mockNotifications = [
            {
                id: 1,
                user: mockUser,
                match: { id: 1 } as Match,
                type: 'MATCH',
                message: 'Notification 1',
                is_read: false,
                created_at: new Date(),
            },
            {
                id: 2,
                user: mockUser,
                match: { id: 2 } as Match,
                type: 'MATCH',
                message: 'Notification 2',
                is_read: false,
                created_at: new Date(),
            },
        ];

        jest.spyOn(repository, 'find').mockResolvedValue(mockNotifications);

        const result = await service.findAll(1);

        expect(repository.find).toHaveBeenCalledWith({
            where: { user: { id: 1 } },
            order: { created_at: 'DESC' },
        });
        expect(result).toEqual(mockNotifications);
    });

    it('should mark a notification as read', async () => {
        const mockNotification = {
            id: 1,
            user: mockUser,
            match: { id: 1 } as Match,
            type: 'MATCH',
            message: 'Notification 1',
            is_read: false,
            created_at: new Date(),
        };

        jest.spyOn(repository, 'findOne').mockResolvedValue(mockNotification);
        jest.spyOn(repository, 'save').mockResolvedValue({
            ...mockNotification,
            created_at: mockNotification.created_at,
            is_read: true,
        });

        const result = await service.markAsRead(1, 1);

        expect(repository.findOne).toHaveBeenCalledWith({
            where: { id: 1, user: { id: 1 } },
        });
        expect(repository.save).toHaveBeenCalledWith({
            ...mockNotification,
            is_read: true,
        });
        expect(result.is_read).toBe(true);
    });

    it('should delete a notification', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue({
            id: 1,
            user: { id: 1 } as any,
            match: { id: 2 } as any,
            message: 'Notification 1',
            created_at: new Date(),
            is_read: true,
            type: '',
        });
        jest.spyOn(repository, 'delete').mockResolvedValue({
            affected: 1,
            raw: {},
        });

        await expect(service.delete(1, 1)).resolves.toBeUndefined();
        expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if notification not found during delete', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue(null);
        jest.spyOn(repository, 'delete').mockResolvedValue({
            affected: 0,
            raw: {},
        });

        await expect(service.delete(1, 1)).rejects.toThrow(
            'Notification not found',
        );
        expect(repository.delete).not.toHaveBeenCalled();
    });
});
