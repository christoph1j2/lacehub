import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from '../entities/notification.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Match } from '../entities/match.entity';

describe('NotificationsController', () => {
    let controller: NotificationsController;
    let service: NotificationsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationsController],
            providers: [
                {
                    provide: NotificationsService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        markAsRead: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<NotificationsController>(
            NotificationsController,
        );
        service = module.get<NotificationsService>(NotificationsService);
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
        last_login: undefined,
    };

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a notification', async () => {
            const mockNotification: Notification = {
                id: 1,
                user: mockUser as User,
                match: { id: 2 } as Match,
                message: 'New match found!',
                created_at: new Date(),
                type: 'MATCH',
                is_read: false,
            };

            const createDto = {
                userId: 1,
                matchId: 2,
                type: '',
                message: 'New match found!',
            };

            jest.spyOn(service, 'create').mockResolvedValue(mockNotification);

            const result = await controller.create(createDto, {
                user: { ...User, id: 1 },
            });

            expect(service.create).toHaveBeenCalledWith(
                createDto.userId,
                createDto.type,
                createDto.message,
                createDto.matchId,
            );
            expect(result).toEqual(mockNotification);
        });
    });

    describe('findAll', () => {
        it('should return all notifications for a user', async () => {
            const mockNotifications: Notification[] = [
                {
                    id: 1,
                    user: { id: 1 } as any,
                    message: 'Notification 1',
                    created_at: new Date(),
                    match: new Match(),
                    type: '',
                    is_read: false,
                },
                {
                    id: 2,
                    user: { id: 1 } as any,
                    message: 'Notification 2',
                    created_at: new Date(),
                    match: new Match(),
                    type: '',
                    is_read: false,
                },
            ];

            jest.spyOn(service, 'findAll').mockResolvedValue(mockNotifications);

            const mockReq = {
                user: { id: 1 },
            };
            const result = await controller.findAll(mockReq);

            expect(service.findAll).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockNotifications);
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            const mockNotification: Notification = {
                id: 1,
                user: { id: 1 } as any,
                match: { id: 2 } as any,
                message: 'Notification 1',
                created_at: new Date(),
                is_read: true,
                type: '',
            };

            jest.spyOn(service, 'markAsRead').mockResolvedValue(
                mockNotification,
            );

            const result = await controller.markAsRead(1, { user: { id: 1 } });

            expect(service.markAsRead).toHaveBeenCalledWith(1, 1);
            expect(result).toEqual(mockNotification);
        });
    });

    describe('delete', () => {
        it('should delete a notification', async () => {
            jest.spyOn(service, 'delete').mockResolvedValue(undefined);

            const result = await controller.delete(1, { user: { id: 1 } });

            expect(service.delete).toHaveBeenCalledWith(1, 1);
            expect(result).toBeUndefined();
        });
    });
});
