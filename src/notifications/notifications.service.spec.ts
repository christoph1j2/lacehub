import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Match } from '../entities/match.entity';
import { MailService } from '../mail/mail.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
    let service: NotificationsService;
    let notificationsRepository: jest.Mocked<Repository<Notification>>;
    let userRepository: jest.Mocked<Repository<User>>;
    let mailService: jest.Mocked<MailService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: getRepositoryToken(Notification),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: MailService,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        notificationsRepository = module.get(getRepositoryToken(Notification));
        userRepository = module.get(getRepositoryToken(User));
        mailService = module.get(MailService);
    });

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hash',
        role_id: 1,
        verificationToken: '',
        verified: true,
        created_at: new Date(),
        credibility_score: 0,
        is_banned: false,
        ban_expiration: null,
        resetToken: '',
        resetTokenExpires: null,
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

    describe('create', () => {
        it('should create a notification and send an email', async () => {
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

            // Mock user notificationsRepository to find the user
            userRepository.findOne.mockResolvedValue(mockUser);

            // Mock notifications notificationsRepository create and save
            notificationsRepository.create.mockReturnValue(mockNotification);
            notificationsRepository.save.mockResolvedValue(mockNotification);

            // Mock mail service
            mailService.sendEmail.mockResolvedValue(undefined);

            const result = await service.create(
                notificationData.userId,
                notificationData.type,
                notificationData.message,
                notificationData.matchId,
            );

            // Verify user was looked up
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: notificationData.userId },
            });

            // Verify notification was created
            expect(notificationsRepository.create).toHaveBeenCalledWith({
                user: { id: notificationData.userId },
                type: notificationData.type,
                message: notificationData.message,
                is_read: false,
                created_at: expect.any(Date),
                match: { id: notificationData.matchId },
            });

            // Verify email was sent
            expect(mailService.sendEmail).toHaveBeenCalledWith(
                mockUser.email,
                `${notificationData.type} notification`,
                notificationData.message,
            );

            // Verify notification was saved
            expect(notificationsRepository.save).toHaveBeenCalledWith(
                mockNotification,
            );

            // Verify return value
            expect(result).toEqual(mockNotification);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            // Mock user notificationsRepository to not find the user
            userRepository.findOne.mockResolvedValue(null);

            await expect(
                service.create(1, 'MATCH', 'New match found!', 2),
            ).rejects.toThrow(NotFoundException);

            // Verify no further actions were taken
            expect(notificationsRepository.create).not.toHaveBeenCalled();
            expect(mailService.sendEmail).not.toHaveBeenCalled();
        });

        it('should create notification without sending email if user has no email', async () => {
            const userWithNoEmail = { ...mockUser, email: '' };
            const notificationData = {
                userId: 1,
                type: 'MATCH',
                message: 'New match found!',
                matchId: 2,
            };

            const mockNotification = {
                id: 1,
                user: userWithNoEmail,
                type: 'MATCH',
                message: 'New match found!',
                match: { id: 2 } as Match,
                is_read: false,
                created_at: new Date(),
            };

            // Mock user notificationsRepository to find the user
            userRepository.findOne.mockResolvedValue(userWithNoEmail);

            // Mock notifications notificationsRepository create and save
            notificationsRepository.create.mockReturnValue(mockNotification);
            notificationsRepository.save.mockResolvedValue(mockNotification);

            const result = await service.create(
                notificationData.userId,
                notificationData.type,
                notificationData.message,
                notificationData.matchId,
            );

            // Verify email was not sent
            expect(mailService.sendEmail).not.toHaveBeenCalled();

            // Verify notification was created and saved
            expect(notificationsRepository.save).toHaveBeenCalledWith(
                mockNotification,
            );
            expect(result).toEqual(mockNotification);
        });
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

        jest.spyOn(notificationsRepository, 'find').mockResolvedValue(
            mockNotifications,
        );

        const result = await service.findAll(1);

        expect(notificationsRepository.find).toHaveBeenCalledWith({
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

        jest.spyOn(notificationsRepository, 'findOne').mockResolvedValue(
            mockNotification,
        );
        jest.spyOn(notificationsRepository, 'save').mockResolvedValue({
            ...mockNotification,
            created_at: mockNotification.created_at,
            is_read: true,
        });

        const result = await service.markAsRead(1, 1);

        expect(notificationsRepository.findOne).toHaveBeenCalledWith({
            where: { id: 1, user: { id: 1 } },
        });
        expect(notificationsRepository.save).toHaveBeenCalledWith({
            ...mockNotification,
            is_read: true,
        });
        expect(result.is_read).toBe(true);
    });

    it('should delete a notification', async () => {
        jest.spyOn(notificationsRepository, 'findOne').mockResolvedValue({
            id: 1,
            user: { id: 1 } as any,
            match: { id: 2 } as any,
            message: 'Notification 1',
            created_at: new Date(),
            is_read: true,
            type: '',
        });
        jest.spyOn(notificationsRepository, 'delete').mockResolvedValue({
            affected: 1,
            raw: {},
        });

        await expect(service.delete(1, 1)).resolves.toBeUndefined();
        expect(notificationsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if notification not found during delete', async () => {
        jest.spyOn(notificationsRepository, 'findOne').mockResolvedValue(null);
        jest.spyOn(notificationsRepository, 'delete').mockResolvedValue({
            affected: 0,
            raw: {},
        });

        await expect(service.delete(1, 1)).rejects.toThrow(
            'Notification not found',
        );
        expect(notificationsRepository.delete).not.toHaveBeenCalled();
    });
});
