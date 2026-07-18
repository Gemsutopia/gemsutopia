'use client';

import { faHeart, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { store } from '@/lib/store';

interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
}

type DashboardOverviewProps = {
  onNavigate?: (section: 'orders' | 'wishlist') => void;
};

export default function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { user } = useBetterAuth();
  const { items: wishlistItems } = useWishlist();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const orderData = await store.orders.list(user.id, { limit: 3 });
        if (cancelled) return;
        setOrders(
          orderData.orders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            status: order.status,
            total: Number(order.total),
          }))
        );
        setOrderCount(orderData.pagination?.totalCount || orderData.orders.length);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stats = [
    { title: 'Total orders', value: orderCount, icon: faShoppingBag, section: 'orders' as const },
    {
      title: 'Wishlist items',
      value: wishlistItems.length,
      icon: faHeart,
      section: 'wishlist' as const,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_45%)] p-6 sm:p-8">
        <p className="mb-5 text-xs tracking-[0.18em] text-white/35 uppercase">
          Gemsutopia collection
        </p>
        <h2 className="font-[family-name:var(--font-bacasime)] text-4xl leading-none sm:text-5xl">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'there'}.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
          Review your orders, saved specimens, and account details in one place.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {stats.map((stat) => (
          <button
            key={stat.title}
            type="button"
            onClick={() => onNavigate?.(stat.section)}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition-colors hover:bg-white/[0.07] sm:p-6"
          >
            <div>
              <p className="text-[11px] tracking-[0.12em] text-white/35 uppercase">{stat.title}</p>
              <p className="mt-2 font-[family-name:var(--font-bacasime)] text-4xl text-white">
                {loading ? '—' : stat.value}
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55">
              <FontAwesomeIcon icon={stat.icon} className="h-4 w-4" />
            </span>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="font-[family-name:var(--font-bacasime)] text-2xl">Recent orders</h2>
          <button
            type="button"
            onClick={() => onNavigate?.('orders')}
            className="text-xs text-white/40 hover:text-white"
          >
            View all
          </button>
        </div>
        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="space-y-3" aria-label="Loading recent orders">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : loadError ? (
            <p className="py-8 text-center text-sm text-white/45">
              Recent orders are temporarily unavailable.
            </p>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <FontAwesomeIcon icon={faShoppingBag} className="mb-3 text-3xl text-white/20" />
              <p className="text-white/45">No orders yet</p>
              <Link
                href="/shop"
                className="mt-3 inline-block text-sm text-white underline underline-offset-4"
              >
                Explore the shop
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.035] p-4 transition-colors hover:bg-white/[0.07]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      Order #{order.orderNumber || order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {new Date(order.createdAt).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatPrice(order.total)}</p>
                    <p className="mt-1 text-[11px] capitalize text-white/35">{order.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <h2 className="font-[family-name:var(--font-bacasime)] text-2xl">Account details</h2>
        <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-white/40">Email</span>
          <span className="break-all text-white">{user?.email}</span>
        </div>
      </section>
    </div>
  );
}
