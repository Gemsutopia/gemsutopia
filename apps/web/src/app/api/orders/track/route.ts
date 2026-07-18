import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('orderNumber')?.trim();
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return ApiError.validation('Order number and email are required');
  }

  try {
    const { order } = await store.orders.track(orderNumber, email);
    const normalizedStatus = order.status.toLowerCase();
    const timeline = [
      { status: 'Order Placed', date: order.createdAt, completed: true },
      {
        status: 'Payment Confirmed',
        date: order.createdAt,
        completed: !['pending_payment', 'payment_failed', 'cancelled'].includes(normalizedStatus),
      },
      {
        status: 'Processing',
        date: null,
        completed: ['processing', 'shipped', 'delivered', 'completed'].includes(normalizedStatus),
      },
      { status: 'Shipped', date: order.shippedAt, completed: Boolean(order.shippedAt) },
      { status: 'Delivered', date: order.deliveredAt, completed: Boolean(order.deliveredAt) },
    ];

    return apiSuccess({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus || 'unknown',
      createdAt: order.createdAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      estimatedDelivery: order.estimatedDelivery || null,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier || null,
      trackingUrl: order.trackingUrl,
      shippingMethod: order.shippingMethod || null,
      shippingDestination: order.shippingDestination || null,
      timeline,
    });
  } catch {
    return ApiError.notFound('Order');
  }
}
