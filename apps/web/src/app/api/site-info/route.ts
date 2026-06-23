import { getSiteInfo } from '@/lib/utils/siteInfo';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return public site information (no auth required)
    const siteInfo = await getSiteInfo();
    return apiSuccess({ siteInfo });
  } catch {
    return ApiError.internal('Failed to fetch site info');
  }
}
