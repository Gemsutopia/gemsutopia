// Email sending utility using Resend
import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@gemsutopia.ca';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'gemsutopia@gmail.com';

export interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const resend = getResendClient();

  if (!resend) {
    return {
      success: false,
      error: 'Email service not configured - missing RESEND_API_KEY',
    };
  }

  try {
    const result = await resend.emails.send({
      from: `Gemsutopia <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

export async function sendToCustomer(
  customerEmail: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  return sendEmail(customerEmail, subject, html);
}

export async function sendToAdmin(
  subject: string,
  html: string
): Promise<SendEmailResult> {
  return sendEmail(ADMIN_EMAIL, subject, html);
}

export async function sendToCustomerAndAdmin(
  customerEmail: string,
  customerSubject: string,
  customerHtml: string,
  adminSubject: string,
  adminHtml: string
): Promise<{ customer: SendEmailResult; admin: SendEmailResult }> {
  const [customer, admin] = await Promise.all([
    sendToCustomer(customerEmail, customerSubject, customerHtml),
    sendToAdmin(adminSubject, adminHtml),
  ]);

  return { customer, admin };
}
