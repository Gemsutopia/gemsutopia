'use client';
import { useState, useEffect } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faHeart, faGavel } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  items?: { name: string }[];
  itemCount?: number;
}

export default function DashboardOverview() {
  const { user } = useBetterAuth();
  const { items: wishlistItems } = useWishlist();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [bidCount, setBidCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { store } = await import('@/lib/store');

        // Fetch orders from Quickdash
        const { orders: ordersList, pagination } = await store.orders.list(user.id, { limit: 3 });
        setOrders(ordersList.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          status: o.status,
          total: Number(o.total),
        })));
        setOrderCount(pagination?.totalCount || ordersList.length);

        // TODO: Bids endpoint not yet implemented in Quickdash Storefront API
        setBidCount(0);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const stats = [
    {
      title: 'Total Orders',
      value: orderCount,
      icon: faShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Wishlist Items',
      value: wishlistItems.length,
      icon: faHeart,
      color: 'bg-pink-500',
    },
    {
      title: 'Active Bids',
      value: bidCount,
      icon: faGavel,
      color: 'bg-amber-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <h1 className="mb-2 text-2xl font-bold">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'there'}!
        </h1>
        <p className="opacity-90">Here&apos;s what&apos;s happening with your account</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {loading ? '—' : stat.value}
                </p>
              </div>
              <div
                className={`${stat.color} flex h-12 w-12 items-center justify-center rounded-lg`}
              >
                <FontAwesomeIcon icon={stat.icon} className="text-xl text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <FontAwesomeIcon icon={faShoppingBag} className="mb-3 text-3xl text-gray-300" />
              <p className="text-gray-500">No orders yet</p>
              <Link href="/shop" className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-800">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.orderNumber || order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(Number(order.total))}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Email Verified</span>
            <span className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
              {user?.emailVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
          {user?.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium text-gray-900">{formatDate(String(user.createdAt))}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
