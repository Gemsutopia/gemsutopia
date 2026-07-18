import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return ApiError.validation('Enter a valid email address');
    }

    await store.collections.submit('newsletter-subscribers', {
      email,
      status: 'subscribed',
      source: 'storefront-footer',
      subscribedAt: new Date().toISOString(),
    });

    return apiSuccess({ subscribed: true }, undefined, 201);
  } catch {
    return ApiError.externalService('QuickDash', 'Newsletter signup is currently unavailable');
  }
}
