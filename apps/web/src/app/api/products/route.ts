import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const limit = Math.min(Math.max(Number(params.get('limit')) || 100, 1), 100);
    const { products, pagination } = await store.products.list({
      page: Math.max(Number(params.get('page')) || 1, 1),
      limit,
      category: params.get('category') || undefined,
      search: params.get('search') || undefined,
      featured: params.has('featured') ? params.get('featured') === 'true' : undefined,
    });

    return apiSuccess({ products, pagination });
  } catch {
    return ApiError.externalService('QuickDash', 'Products are currently unavailable');
  }
}
