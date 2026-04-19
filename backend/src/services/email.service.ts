import nodemailer from 'nodemailer';
import { env } from '../config/env';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationLink = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your email - Intellistock',
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
  }
};

export const sendInviteEmail = async (to: string, orgName: string, inviteLink: string) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject: `Invitation to join ${orgName} on Intellistock`,
    html: `<p>You have been invited to join ${orgName}. Click <a href="${inviteLink}">here</a> to accept the invitation.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Invite email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending invite email:', error);
  }
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject: 'Password Reset - Intellistock',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending password reset email:', error);
  }
};

export const sendPurchaseOrderEmail = async (to: string, poData: any) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject: `Purchase Order ${poData.poNumber} - Intellistock`,
    html: `<p>Please find attached the purchase order ${poData.poNumber}.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`PO email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending PO email:', error);
  }
};
