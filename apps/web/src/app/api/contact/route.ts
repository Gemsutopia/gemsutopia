import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || name.length > 100) return ApiError.validation('Enter your name');
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return ApiError.validation('Enter a valid email address');
    }
    if (!subject || subject.length > 160) return ApiError.validation('Enter a subject');
    if (message.length < 10 || message.length > 5000) {
      return ApiError.validation('Message must be between 10 and 5,000 characters');
    }

    const { entry } = await store.collections.submit('contact-submissions', {
      name,
      email,
      subject,
      message,
      status: 'new',
      source: 'storefront',
      submittedAt: new Date().toISOString(),
    });

    return apiSuccess({ submissionId: entry.id }, undefined, 201);
  } catch {
    return ApiError.externalService('QuickDash', 'Your message could not be submitted right now');
  }
}
