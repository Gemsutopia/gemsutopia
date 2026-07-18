import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const { auction } = await store.auctions.get(id);
    return apiSuccess({
      auction: {
        id: auction.id,
        title: auction.title,
        description: auction.description,
        images: auction.images || [],
        startingBid: auction.startingPrice,
        currentBid: auction.currentBid || auction.startingPrice,
        reservePrice: null,
        bidCount: auction.bidCount || 0,
        startTime: auction.startsAt,
        endTime: auction.endsAt,
        status: auction.status,
        isActive: auction.status === 'active',
      },
    });
  } catch {
    return ApiError.notFound('Auction');
  }
}
