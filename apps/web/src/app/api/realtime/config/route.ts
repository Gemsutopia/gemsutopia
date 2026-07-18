import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { site } = await store.site.getSettings();
    if (!site.pusher) {
      return ApiError.externalService('QuickDash', 'Realtime updates are not configured');
    }

    return apiSuccess({
      key: site.pusher.key,
      cluster: site.pusher.cluster,
      channelPrefix: site.pusher.channelPrefix,
    });
  } catch {
    return ApiError.externalService('QuickDash', 'Realtime configuration is unavailable');
  }
}
