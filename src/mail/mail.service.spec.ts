import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
    let service: MailService;
    let mockTransporter: { sendMail: jest.Mock };

    beforeEach(async () => {
        // Create mock transporter
        mockTransporter = {
            sendMail: jest.fn().mockResolvedValue({}),
        };

        // Mock the createTransport function
        (nodemailer.createTransport as jest.Mock).mockReturnValue(
            mockTransporter,
        );

        const module: TestingModule = await Test.createTestingModule({
            providers: [MailService],
        }).compile();

        service = module.get<MailService>(MailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should send verification email with the correct parameters', async () => {
        const email = 'test@example.com';
        const token = 'dummy-token';
        const expectedUrl = `http://localhost:3000/auth/verify-email?token=${token}`;

        await service.sendVerificationEmail(email, token);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
            from: 'LaceHub <admin@lacehub.cz>',
            to: email,
            subject: 'Email verification',
            text: `<p>Please verify your email by clicking <a href="${expectedUrl}">here</a></p>`,
        });
    });

    it('should send password reset email with the correct parameters', async () => {
        const email = 'test@example.com';
        const token = 'reset-token';
        const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;

        await service.sendPasswordResetEmail(email, token);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
            from: 'LaceHub <admin@lacehub.cz>',
            to: email,
            subject: 'Password Reset Request',
            text: `<p>Reset your password by clicking <a href="${resetUrl}">here</a></p>`,
        });
    });
});
