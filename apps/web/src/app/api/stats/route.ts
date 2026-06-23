import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApiError } from '@/lib/api';

export const revalidate = 300;

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
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch {
    return ApiError.internal('Failed to fetch stats');
  }
}
