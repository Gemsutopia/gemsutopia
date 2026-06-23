import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/referrals?email=user@example.com
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return ApiError.validation('Missing email parameter');
    }

    const result = await store.referrals.get(email);
    return apiSuccess(result);
  } catch (error) {
    return ApiError.internal('Failed to fetch referral data');
  }
}

// POST /api/referrals — Generate a referral code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return ApiError.validation('Missing email');
    }

    const result = await store.referrals.generate(email);
    return apiSuccess(result);
  } catch (error) {
    return ApiError.internal('Failed to generate referral code');
  }
}
