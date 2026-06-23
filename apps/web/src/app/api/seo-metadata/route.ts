import { getSEOMetadata } from '@/lib/utils/seoMetadata';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return public SEO metadata (no auth required)
    return apiSuccess({ metadata: getSEOMetadata() });
  } catch {
    return ApiError.internal('Failed to fetch SEO metadata');
  }
}
