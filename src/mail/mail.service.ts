import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        host: 'smtp.seznam.cz',
        port: 465,
        secure: true,
        auth: {
            user: 'admin@lacehub.cz',
            pass: 'PrestizniSkola',
        },
    });

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        await this.transporter.sendMail({
            from: 'LaceHub Notifications <admin@lacehub.cz>',
            to,
            subject,
            text: body,
        });

        console.log(`Email sent to ${to} with subject: ${subject}`);
    }

    async sendVerificationEmail(to: string, token: string) {
        // ! ONLY FOR LOCAL DEVELOPMENT
        const url = `http://localhost:3000/auth/verify-email?token=${token}`; // TODO! CHANGE URL IN PRODUCTION VERISON
        //const url = `https://lacehub.cz/auth/verify-email?token=${token}`;
        await this.transporter.sendMail({
            from: 'LaceHub <admin@lacehub.cz>',
            to,
            subject: 'Email verification',
            text: `<p>Please verify your email by clicking <a href="${url}">here</a></p>`,
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        // ! ONLY FOR LOCAL DEVELOPMENT
        const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`; // TODO! CHANGE URL IN PRODUCTION
        //const resetUrl = `https://lacehub.cz/auth/reset-password?token=${token}`;
        await this.transporter.sendMail({
            from: 'LaceHub <admin@lacehub.cz>',
            to,
            subject: 'Password Reset Request',
            text: `<p>Reset your password by clicking <a href="${resetUrl}">here</a></p>`,
        });
    }
}
