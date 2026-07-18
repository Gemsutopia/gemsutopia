import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { categories } = await store.categories.list({ count: true });
    return apiSuccess({ categories });
  } catch {
    return ApiError.externalService('QuickDash', 'Categories are currently unavailable');
  }
}
