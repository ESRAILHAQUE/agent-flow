import { config } from '../config/index.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  // If no SMTP details, we log the email content in development for easy debugging
  if (!config.email.host || !config.email.user || !config.email.pass) {
    console.log(`
    ✉️  [Email Sent (Mock)]
    To:      ${to}
    Subject: ${subject}
    Body:
    ${html}
    `);
    return;
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error);
    // Fallback to logs in case SMTP fails
    console.log(`
    ✉️  [Email Fallback Log]
    To:      ${to}
    Subject: ${subject}
    Body:
    ${html}
    `);
  }
}

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verificationUrl = `${config.clientUrl}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email address - AgentFlow',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to AgentFlow, ${name}!</h2>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Verify Email</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password - AgentFlow',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello, ${name}!</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendSuspensionEmail(email: string, name: string, reason: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Action Required: Account Suspended - AgentFlow',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello, ${name}</h2>
        <p>We are writing to inform you that your AgentFlow account has been suspended.</p>
        <p><strong>Reason for suspension:</strong><br/>
        <span style="color: #ef4444; font-weight: 500;">${reason}</span></p>
        <p>While suspended, you will not be able to log into the platform or access your resources.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 14px;">If you believe this is a mistake, please reply to this email to contact our support team.</p>
      </div>
    `,
  });
}
