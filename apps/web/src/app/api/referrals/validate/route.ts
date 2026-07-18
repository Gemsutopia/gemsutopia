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

    const normalizedCode = String(code).trim().toUpperCase();
    const subtotal = Number(orderTotal);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return ApiError.validation('Invalid order total');
    }

    try {
      const referral = await store.referrals.validate(normalizedCode, customerEmail, subtotal);
      if (referral.valid && referral.discount) {
        return apiSuccess({ ...referral, type: 'referral', code: normalizedCode });
      }
    } catch {
      // A referral lookup failure should not prevent validating a normal discount code.
    }

    const discountResult = await store.discounts.validate(normalizedCode, subtotal);
    if (!discountResult.valid || !discountResult.discount) {
      return apiSuccess({ valid: false, type: 'discount', code: normalizedCode });
    }

    return apiSuccess({
      valid: true,
      type: 'discount',
      code: normalizedCode,
      discount: {
        ...discountResult.discount,
        amount: Math.min(
          subtotal,
          Math.max(0, Number(discountResult.discount.discountAmount) || 0)
        ),
        free_shipping: false,
      },
    });
  } catch {
    return ApiError.externalService('QuickDash', 'Discount validation is currently unavailable');
  }
}
