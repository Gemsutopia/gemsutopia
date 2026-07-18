import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { stats } = await store.stats.list();

    const mappedStats = stats.map(stat => ({
      id: stat.id,
      title: stat.title,
      value: stat.value,
      description: stat.description,
      icon: stat.icon,
      sort_order: stat.sortOrder,
    }));

    return NextResponse.json(
      { success: true, data: { stats: mappedStats } },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return ApiError.internal('Failed to fetch stats');
  }
}
