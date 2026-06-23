import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

// POST /api/referrals/apply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralId, orderId, orderTotal, discountApplied, referredEmail, referredName } = body;

    if (!referralId || !orderId || !referredEmail) {
      return ApiError.validation('Missing required fields: referralId, orderId, referredEmail');
    }

    const result = await store.referrals.apply({
      referralId,
      orderId,
      orderTotal: orderTotal || 0,
      discountApplied: discountApplied || 0,
      referredEmail,
      referredName: referredName || '',
    });

    return apiSuccess(result);
  } catch (error) {
    return ApiError.internal('Failed to apply referral');
  }
}
