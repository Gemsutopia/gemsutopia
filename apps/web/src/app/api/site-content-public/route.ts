import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { content } = await store.siteContent.list();

    // Transform compound keys "section:key" → {section, key, value, content_type, is_active}
    const mappedContent = content
      .filter(item => item.value && item.key.includes(':'))
      .map(item => {
        const colonIdx = item.key.indexOf(':');
        return {
          id: item.id,
          section: item.key.slice(0, colonIdx),
          key: item.key.slice(colonIdx + 1),
          content_type: item.type,
          value: item.value!,
          is_active: true,
        };
      });

    return NextResponse.json(
      { success: true, data: { content: mappedContent, count: mappedContent.length } },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch {
    return ApiError.internal('Failed to fetch site content');
  }
}
