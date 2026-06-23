'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faEye, faDownload, faFilter, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useBetterAuth } from '@/contexts/BetterAuthContext';

interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  currency: string;
  items: OrderItem[];
  trackingNumber?: string;
  trackingUrl?: string;
}

export default function UserOrders() {
  const { user } = useBetterAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const { store } = await import('@/lib/store');
      const { orders: ordersList } = await store.orders.list(user.id);

      setOrders(ordersList.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        date: o.createdAt,
        status: o.status,
        total: Number(o.total),
        currency: 'USD', // Default currency
        items: [], // Items not returned in list endpoint
        trackingNumber: o.trackingNumber || undefined,
        trackingUrl: o.trackingUrl || undefined,
      })));
    } catch {
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'confirmed':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter(order => order.status?.toLowerCase() === filterStatus);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="mb-4 h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="mb-4 text-red-800">{error}</p>
        <button
          onClick={fetchOrders}
          className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

        {/* Filter */}
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="all">All Orders</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg bg-white py-12 text-center shadow-md">
            <FontAwesomeIcon icon={faShoppingBag} className="mb-4 text-4xl text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mb-6 text-gray-600">
              {filterStatus === 'all'
                ? "You haven't placed any orders yet."
                : `No ${filterStatus} orders found.`}
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="overflow-hidden rounded-lg bg-white shadow-md">
              {/* Order Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.total, order.currency)}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                  </div>
                </div>
                {order.trackingNumber && (
                  <p className="mt-2 text-sm text-gray-600">
                    Tracking: <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-200">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FontAwesomeIcon icon={faShoppingBag} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.price, order.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="mt-6 flex flex-col space-y-2 border-t border-gray-200 pt-6 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-center space-x-2 rounded-lg border border-purple-600 px-4 py-2 text-purple-600 transition-colors hover:bg-purple-50"
                  >
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>

                  {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'completed') && (
                    <button className="flex items-center justify-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50">
                      <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                      <span>Download Invoice</span>
                    </button>
                  )}

                  {order.trackingNumber && order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                    >
                      <span>Track Package</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
