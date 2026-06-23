import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api';

const API_VERSION = '1.0.0';

/**
 * /connect endpoint - Placeholder for future integration
 *
 * GET - Returns connection status and API information
 * POST - Acknowledges connection requests
 */

export async function GET() {
  return apiSuccess({
    status: 'available',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      auctions: '/api/auctions',
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return apiSuccess(
    {
      status: 'acknowledged',
      message: 'Connection request received',
      requestId: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      payload: body,
    },
    'Connection acknowledged'
  );
}
