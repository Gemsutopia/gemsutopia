import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';
import { StorefrontError } from '@/lib/storefront-client';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const { product } = await store.products.get(id);
    return apiSuccess({ product });
  } catch (error) {
    if (error instanceof StorefrontError && error.status === 404) {
      return ApiError.notFound('Product');
    }
    return ApiError.externalService('QuickDash', 'Product details are currently unavailable');
  }
}
