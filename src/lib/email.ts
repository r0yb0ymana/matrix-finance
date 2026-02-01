/**
 * Email Service Utility
 *
 * Handles sending emails via Resend API
 * Supports magic links, OTP codes, and notifications
 *
 * @module lib/email
 */

// =====================================================
// Email Provider Configuration
// =====================================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Resend API
 * @see https://resend.com/docs/api-reference/emails/send-email
 */
async function sendViaResend(options: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@matrixfinance.com.au';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  console.log('✓ Email sent:', data.id);
}

/**
 * Send email (with fallback to console in development)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useMock = process.env.USE_MOCK_EMAIL === 'true';

  // In development, optionally log to console instead of sending
  if (isDevelopment && useMock) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 MOCK EMAIL (Development Mode)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('\nContent:');
    console.log(options.text || options.html);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  // Send via Resend in production or when not mocked
  await sendViaResend(options);
}

// =====================================================
// Email Templates
// =====================================================

/**
 * Get base HTML template with Matrix Finance branding
 */
function getEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matrix Equipment Finance</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #F5F8FC;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
    }
    .header {
      background-color: #1E2C5E;
      padding: 32px 24px;
      text-align: center;
    }
    .logo {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    .content {
      padding: 40px 24px;
    }
    .footer {
      background-color: #F5F8FC;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #6B7280;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #1E2C5E;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .code {
      font-size: 32px;
      font-weight: 700;
      color: #1E2C5E;
      letter-spacing: 8px;
      text-align: center;
      padding: 20px;
      background-color: #F5F8FC;
      border-radius: 8px;
      margin: 24px 0;
    }
    .text-muted {
      color: #6B7280;
      font-size: 14px;
    }
    h1 {
      color: #1E2C5E;
      font-size: 24px;
      margin: 0 0 16px 0;
    }
    p {
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Matrix Equipment Finance</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p class="text-muted">
        This email was sent to you because you started an application with Matrix Equipment Finance.<br>
        If you didn't request this, you can safely ignore this email.
      </p>
      <p class="text-muted">
        © 2026 Matrix Equipment Finance. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Magic link email template
 */
export function getMagicLinkEmail(magicLink: string): { html: string; text: string } {
  const html = getEmailTemplate(`
    <h1>Access Your Application</h1>
    <p>Click the button below to access your Matrix Equipment Finance application:</p>
    <p style="text-align: center;">
      <a href="${magicLink}" class="button">Access Application</a>
    </p>
    <p class="text-muted">
      Or copy and paste this link into your browser:<br>
      <span style="word-break: break-all;">${magicLink}</span>
    </p>
    <p class="text-muted">
      This link will expire in 24 hours and can only be used once.
    </p>
  `);

  const text = `
Matrix Equipment Finance - Access Your Application

Click the link below to access your application:
${magicLink}

This link will expire in 24 hours and can only be used once.

If you didn't request this, you can safely ignore this email.

© 2026 Matrix Equipment Finance
  `.trim();

  return { html, text };
}

/**
 * OTP code email template
 */
export function getOTPEmail(code: string): { html: string; text: string } {
  const html = getEmailTemplate(`
    <h1>Your Verification Code</h1>
    <p>Enter this code to continue with your application:</p>
    <div class="code">${code}</div>
    <p class="text-muted">
      This code will expire in 10 minutes.
    </p>
    <p class="text-muted">
      If you didn't request this code, please ignore this email.
    </p>
  `);

  const text = `
Matrix Equipment Finance - Your Verification Code

Your verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

© 2026 Matrix Equipment Finance
  `.trim();

  return { html, text };
}

/**
 * Application submitted confirmation email
 */
export function getApplicationSubmittedEmail(
  applicationNumber: string,
  businessName: string
): { html: string; text: string } {
  const html = getEmailTemplate(`
    <h1>Application Submitted Successfully</h1>
    <p>Thank you for submitting your equipment finance application.</p>
    <p><strong>Application Number:</strong> ${applicationNumber}</p>
    <p><strong>Business Name:</strong> ${businessName}</p>
    <p>
      Our team will review your application and contact you within 1-2 business days.
    </p>
    <p>
      You can check the status of your application by clicking the link in your original application email.
    </p>
  `);

  const text = `
Matrix Equipment Finance - Application Submitted

Thank you for submitting your equipment finance application.

Application Number: ${applicationNumber}
Business Name: ${businessName}

Our team will review your application and contact you within 1-2 business days.

© 2026 Matrix Equipment Finance
  `.trim();

  return { html, text };
}

/**
 * Application status update email
 */
export function getApplicationStatusEmail(
  applicationNumber: string,
  status: string,
  message: string
): { html: string; text: string } {
  const statusColors: Record<string, string> = {
    approved: '#10B981',
    declined: '#EF4444',
    under_review: '#F59E0B',
    awaiting_signature: '#3B82F6',
  };

  const color = statusColors[status] || '#6B7280';

  const html = getEmailTemplate(`
    <h1>Application Update</h1>
    <p><strong>Application Number:</strong> ${applicationNumber}</p>
    <p>
      <span style="display: inline-block; padding: 6px 12px; background-color: ${color}; color: white; border-radius: 4px; font-weight: 600; text-transform: capitalize;">
        ${status.replace(/_/g, ' ')}
      </span>
    </p>
    <p>${message}</p>
  `);

  const text = `
Matrix Equipment Finance - Application Update

Application Number: ${applicationNumber}
Status: ${status.replace(/_/g, ' ').toUpperCase()}

${message}

© 2026 Matrix Equipment Finance
  `.trim();

  return { html, text };
}

// =====================================================
// Convenience Functions
// =====================================================

/**
 * Send magic link email
 */
export async function sendMagicLink(email: string, magicLink: string): Promise<void> {
  const { html, text } = getMagicLinkEmail(magicLink);

  await sendEmail({
    to: email,
    subject: 'Access Your Matrix Finance Application',
    html,
    text,
  });
}

/**
 * Send OTP code email
 */
export async function sendOTP(email: string, code: string): Promise<void> {
  const { html, text } = getOTPEmail(code);

  await sendEmail({
    to: email,
    subject: 'Your Verification Code',
    html,
    text,
  });
}

/**
 * Send application submitted confirmation
 */
export async function sendApplicationSubmitted(
  email: string,
  applicationNumber: string,
  businessName: string
): Promise<void> {
  const { html, text } = getApplicationSubmittedEmail(applicationNumber, businessName);

  await sendEmail({
    to: email,
    subject: `Application Submitted - ${applicationNumber}`,
    html,
    text,
  });
}

/**
 * Send application status update
 */
export async function sendApplicationStatus(
  email: string,
  applicationNumber: string,
  status: string,
  message: string
): Promise<void> {
  const { html, text } = getApplicationStatusEmail(applicationNumber, status, message);

  await sendEmail({
    to: email,
    subject: `Application Update - ${applicationNumber}`,
    html,
    text,
  });
}
