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

    it('should send regular email with the correct parameters', async () => {
        const email = 'test@example.com';
        const subject = 'Test Subject';
        const body = 'This is a test email';

        await service.sendEmail(email, subject, body);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'LaceHub Notifications <admin@lacehub.cz>',
                to: email,
                subject,
                text: body,
                html: expect.stringContaining('<p>This is a test email</p>'),
            }),
        );
    });

    it('should use correct URL for verification emails', async () => {
        const email = 'test@example.com';
        const token = 'dummy-token';
        const expectedUrl = `https://api.lacehub.cz/auth/verify-email?token=${token}`;

        await service.sendVerificationEmail(email, token);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'LaceHub <admin@lacehub.cz>',
                to: email,
                subject: 'Verify Your LaceHub Email',
                html: expect.stringContaining(expectedUrl),
            }),
        );
    });

    it('should use correct URL for password reset emails', async () => {
        const email = 'test@example.com';
        const token = 'reset-token';
        const expectedUrl = `https://api.lacehub.cz/auth/reset-password?token=${token}`;

        await service.sendPasswordResetEmail(email, token);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'LaceHub <admin@lacehub.cz>',
                to: email,
                subject: 'Reset Your LaceHub Password',
                html: expect.stringContaining(expectedUrl),
            }),
        );
    });

    it('should handle email sending errors', async () => {
        mockTransporter.sendMail.mockRejectedValueOnce(
            new Error('Failed to send email'),
        );
        const email = 'test@example.com';
        const subject = 'Test Subject';
        const body = 'Test Body';

        // Using try/catch to verify the error is propagated
        await expect(service.sendEmail(email, subject, body)).rejects.toThrow(
            'Failed to send email',
        );
    });

    it('should include proper HTML structure in email templates', async () => {
        const email = 'test@example.com';
        const token = 'test-token';

        await service.sendVerificationEmail(email, token);

        const emailData = mockTransporter.sendMail.mock.calls[0][0];
        expect(emailData.html).toContain('<h2>Email Verification</h2>');
        expect(emailData.html).toContain('LaceHub</h1>');
        expect(emailData.html).toContain('class="button"');
        expect(emailData.html).toContain(`${new Date().getFullYear()} LaceHub`);
    });
});
