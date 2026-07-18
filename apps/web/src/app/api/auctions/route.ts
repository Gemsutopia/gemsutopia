import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const status = params.get('status');
    const { auctions, pagination } = await store.auctions.list({
      page: Math.max(Number(params.get('page')) || 1, 1),
      limit: Math.min(Math.max(Number(params.get('limit')) || 20, 1), 100),
      status:
        status === 'active' || status === 'scheduled' || status === 'upcoming' || status === 'ended'
          ? status
          : undefined,
    });

    const mappedAuctions = auctions.map(auction => ({
      id: auction.id,
      title: auction.title,
      description: auction.description,
      images: auction.images || [],
      featuredImageIndex: 0,
      startingBid: auction.startingPrice,
      currentBid: auction.currentBid || auction.startingPrice,
      reservePrice: null,
      bidCount: auction.bidCount || 0,
      startTime: auction.startsAt,
      endTime: auction.endsAt,
      status: auction.status,
      isActive: auction.status === 'active',
    }));

    return apiSuccess({ auctions: mappedAuctions, pagination });
  } catch {
    return ApiError.externalService('QuickDash', 'Auctions are currently unavailable');
  }
}
