import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { to, subject, html } = request.body;

        if (!to || !to.length) {
            return response.status(400).json({ error: 'Missing recipient email(s)' });
        }

        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.error('SMTP credentials are not configured in Vercel environment variables.');
            return response.status(500).json({ error: 'Server email configuration is missing' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `"EduBridge Notifications" <${process.env.SMTP_EMAIL}>`,
            bcc: to, // Use BCC so students can't see each other's email addresses
            subject: subject,
            html: html,
        });

        return response.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Email sending error:', error);
        return response.status(500).json({ error: 'Failed to send email' });
    }
}
