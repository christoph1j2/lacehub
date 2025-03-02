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

    private getEmailTemplate(
        content: string,
        buttonText: string,
        buttonUrl: string,
    ) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LaceHub</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color:rgb(179, 80, 0);
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: rgb(179, 80, 0);
                    padding: 20px;
                    text-align: center;
                }
                .header h1 {
                    color: #ffffff;
                    margin: 0;
                }
                .content {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 4px;
                    box-shadow: 0 2px 4px rgb(0, 0, 0);
                }
                .button {
                    display: inline-block;
                    background-color: rgb(179, 80, 0);
                    color: #ffffff !important;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    margin-top: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>LaceHub</h1>
                </div>
                <div class="content">
                    ${content}
                    <div style="text-align: center;">
                        <a href="${buttonUrl}" class="button">${buttonText}</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} LaceHub. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        await this.transporter.sendMail({
            from: 'LaceHub Notifications <admin@lacehub.cz>',
            to,
            subject,
            text: body, // Plain text version
            html: this.getEmailTemplate(`<p>${body}</p>`, null, null), // HTML version without button
        });

        console.log(`Email sent to ${to} with subject: ${subject}`);
    }

    async sendVerificationEmail(to: string, token: string) {
        const url = `https://api.lacehub.cz/auth/verify-email?token=${token}`;
        const plainText = `Please verify your email by visiting this link: ${url}`;
        const htmlContent = `
            <h2>Email Verification</h2>
            <p>Thank you for registering with LaceHub! Please verify your email address by clicking the button below.</p>
        `;

        await this.transporter.sendMail({
            from: 'LaceHub <admin@lacehub.cz>',
            to,
            subject: 'Verify Your LaceHub Email',
            text: plainText,
            html: this.getEmailTemplate(htmlContent, 'Verify Email', url),
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        const resetUrl = `https://api.lacehub.cz/auth/reset-password?token=${token}`;
        const plainText = `Reset your password by visiting this link: ${resetUrl}`;
        const htmlContent = `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to create a new password.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
        `;

        await this.transporter.sendMail({
            from: 'LaceHub <admin@lacehub.cz>',
            to,
            subject: 'Reset Your LaceHub Password',
            text: plainText,
            html: this.getEmailTemplate(
                htmlContent,
                'Reset Password',
                resetUrl,
            ),
        });
    }
}
