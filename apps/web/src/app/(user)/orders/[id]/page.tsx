'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { IconArrowLeft, IconPackage, IconTruck, IconCheck, IconClock, IconCopy } from '@tabler/icons-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingMethod: string;
  trackingNumber: string;
  carrier: string;
  carrierTrackingUrl: string;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  discountCode: string;
  total: string;
  currency: string;
  items: OrderItem[];
  itemCount: number;
  customerNotes: string;
  createdAt: string;
  shippedAt: string;
  deliveredAt: string;
  estimatedDelivery: string;
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function getStatusIndex(status: string): number {
  const idx = STATUS_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800',
    disputed: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useBetterAuth();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = params.id as string;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { store } = await import('@/lib/store');
        const { order: quickdashOrder } = await store.orders.get(orderId);

        // Map Quickdash order to local Order type
        setOrder({
          id: quickdashOrder.id,
          orderNumber: quickdashOrder.orderNumber,
          status: quickdashOrder.status,
          paymentStatus: 'paid', // Default since not exposed
          paymentMethod: 'stripe', // Default since not exposed
          customerName: user.name || user.email || '',
          customerEmail: user.email || '',
          customerPhone: '',
          shippingAddressLine1: '',
          shippingAddressLine2: '',
          shippingCity: '',
          shippingProvince: '',
          shippingPostalCode: '',
          shippingCountry: '',
          shippingMethod: '',
          trackingNumber: quickdashOrder.trackingNumber || '',
          carrier: '',
          carrierTrackingUrl: quickdashOrder.trackingUrl || '',
          subtotal: quickdashOrder.subtotal,
          shippingCost: quickdashOrder.shippingAmount,
          taxAmount: quickdashOrder.taxAmount,
          discountAmount: '0',
          discountCode: '',
          total: quickdashOrder.total,
          currency: 'USD',
          items: [], // Items need to be fetched separately or included in response
          itemCount: 0,
          customerNotes: '',
          createdAt: quickdashOrder.createdAt,
          shippedAt: quickdashOrder.shippedAt || '',
          deliveredAt: quickdashOrder.deliveredAt || '',
          estimatedDelivery: '',
        });
      } catch (err: any) {
        if (err?.status === 404) {
          setError('Order not found');
        } else if (err?.status === 403) {
          setError('You do not have permission to view this order');
        } else {
          setError('Failed to load order');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, authLoading, router]);

  const copyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-black" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <p className="text-lg text-gray-600">{error || 'Order not found'}</p>
          <Link href="/dashboard" className="mt-4 text-purple-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusIndex = getStatusIndex(order.status);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <IconArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress tracker */}
        {!['cancelled', 'refunded', 'failed', 'disputed'].includes(order.status) && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    i <= statusIndex ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i < statusIndex ? <IconCheck size={16} /> : i + 1}
                  </div>
                  <span className="mt-2 text-xs capitalize text-gray-600 hidden sm:block">{step}</span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute h-0.5 w-full ${i < statusIndex ? 'bg-purple-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Items ({order.itemCount})</h2>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div key={item.id || i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${item.id}`} className="font-medium text-gray-900 hover:text-purple-600">
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <IconTruck size={20} />
                  Tracking
                </h2>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-sm text-gray-700">{order.trackingNumber}</p>
                  <button onClick={copyTracking} className="text-gray-400 hover:text-gray-600" title="Copy">
                    <IconCopy size={16} />
                  </button>
                </div>
                {order.carrier && (
                  <p className="mt-1 text-sm capitalize text-gray-500">
                    via {order.carrier.replace('_', ' ')}
                  </p>
                )}
                {order.carrierTrackingUrl && (
                  <a
                    href={order.carrierTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-purple-600 hover:underline"
                  >
                    Track Package →
                  </a>
                )}
                {order.estimatedDelivery && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                    <IconClock size={14} />
                    Estimated: {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="text-gray-900">{formatPrice(parseFloat(order.subtotal))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Shipping</dt>
                  <dd className="text-gray-900">
                    {parseFloat(order.shippingCost) === 0 ? 'Free' : formatPrice(parseFloat(order.shippingCost))}
                  </dd>
                </div>
                {parseFloat(order.taxAmount || '0') > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Tax</dt>
                    <dd className="text-gray-900">{formatPrice(parseFloat(order.taxAmount))}</dd>
                  </div>
                )}
                {parseFloat(order.discountAmount || '0') > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">
                      Discount {order.discountCode && <span className="font-mono">({order.discountCode})</span>}
                    </dt>
                    <dd className="text-green-600">-{formatPrice(parseFloat(order.discountAmount))}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold">
                  <dt className="text-gray-900">Total</dt>
                  <dd className="text-gray-900">{formatPrice(parseFloat(order.total))}</dd>
                </div>
              </dl>
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <IconPackage size={20} />
                Shipping
              </h2>
              <p className="text-sm text-gray-700">{order.customerName}</p>
              <p className="text-sm text-gray-600">{order.shippingAddressLine1}</p>
              {order.shippingAddressLine2 && (
                <p className="text-sm text-gray-600">{order.shippingAddressLine2}</p>
              )}
              <p className="text-sm text-gray-600">
                {order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}
              </p>
              <p className="text-sm text-gray-600">{order.shippingCountry}</p>
              {order.shippingMethod && (
                <p className="mt-2 text-sm capitalize text-gray-500">
                  Method: {order.shippingMethod.replace('_', ' ')}
                </p>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Payment</h2>
              <p className="text-sm capitalize text-gray-700">
                {order.paymentMethod?.replace('_', ' ') || 'N/A'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Status: <span className="capitalize">{order.paymentStatus}</span>
              </p>
            </div>

            {/* Notes */}
            {order.customerNotes && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Notes</h2>
                <p className="text-sm text-gray-600">{order.customerNotes}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
