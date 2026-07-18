import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: Promise<{ pageId: string }> }) {
  // Frontend copy is authoritative while the storefront is being rebuilt.
  // Re-enable deliberately once QuickDash content has been migrated and verified.
  if (process.env.NEXT_PUBLIC_QUICKDASH_PAGE_CONTENT !== 'true') {
    return apiSuccess({ content: {} });
  }

  const params = await context.params;
  try {
    const { content } = await store.siteContent.list();

    // Site content uses compound keys like "about:title", "about:description"
    // pageId is the prefix before the colon
    const prefix = `${params.pageId}:`;

    const contentMap = content
      .filter(item => item.key.startsWith(prefix) && item.value)
      .reduce((acc: Record<string, string>, item) => {
        const key = item.key.slice(prefix.length);
        acc[key] = item.value!;
        return acc;
      }, {});

    return apiSuccess({ content: contentMap });
  } catch {
    return ApiError.internal('Failed to fetch page content');
  }
}
