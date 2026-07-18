import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit')) || 20, 1), 50);
    const { bids } = await store.auctions.getBids(id, limit);
    return apiSuccess({ bids });
  } catch {
    return ApiError.externalService('QuickDash', 'Bid history is unavailable');
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const amount = Number(body.bid_amount);
    const bidderEmail = typeof body.bidder_email === 'string' ? body.bidder_email.trim().toLowerCase() : '';
    const bidderName = typeof body.bidder_name === 'string' ? body.bidder_name.trim() : '';

    if (!Number.isFinite(amount) || amount <= 0) return ApiError.validation('Enter a valid bid');
    if (!bidderEmail || !bidderEmail.includes('@')) return ApiError.validation('Enter a valid email');
    if (!bidderName || bidderName.length > 100) return ApiError.validation('Enter your name');

    const result = await store.auctions.placeBid(id, { amount, bidderEmail, bidderName });
    return apiSuccess({ bid: result.bid, reserveMet: result.reserveMet }, undefined, 201);
  } catch (error) {
    return ApiError.externalService(
      'QuickDash',
      error instanceof Error ? error.message : 'The bid could not be placed'
    );
  }
}
