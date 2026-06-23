import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

// POST /api/referrals/validate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, customerEmail, orderTotal } = body;

    if (!code) {
      return ApiError.validation('Missing code');
    }

    const result = await store.referrals.validate(code, customerEmail, orderTotal);
    return apiSuccess(result);
  } catch (error) {
    return ApiError.internal('Failed to validate referral code');
  }
}
