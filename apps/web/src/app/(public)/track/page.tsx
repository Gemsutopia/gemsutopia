'use client';

import { useState } from 'react';
import { IconSearch, IconPackage, IconCheck, IconTruck, IconHome, IconCopy, IconExternalLink } from '@tabler/icons-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface TimelineStep {
  status: string;
  date: string | null;
  completed: boolean;
}

interface TrackingData {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedDelivery: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  trackingUrl: string | null;
  shippingMethod: string | null;
  shippingDestination: string | null;
  timeline: TimelineStep[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setTracking(null);

    try {
      const params = new URLSearchParams({ orderNumber: orderNumber.trim() });
      if (email.trim()) params.append('email', email.trim());

      const res = await fetch(`/api/orders/track?${params}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Order not found. Please check your order number and try again.');
      } else {
        setTracking(data.data);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyTracking = () => {
    if (tracking?.trackingNumber) {
      navigator.clipboard.writeText(tracking.trackingNumber);
      toast.success('Tracking number copied');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'Order Placed': return IconPackage;
      case 'Payment Confirmed': return IconCheck;
      case 'Processing': return IconPackage;
      case 'Shipped': return IconTruck;
      case 'Delivered': return IconHome;
      default: return IconCheck;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'shipped': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'processing': case 'confirmed': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cancelled': case 'refunded': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-3xl text-white md:text-4xl">
          Track Your Order
        </h1>
        <p className="text-sm text-white/60">
          Enter your order number to check the status of your shipment
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="orderNumber" className="text-xs text-white/70">
            Order Number <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="orderNumber"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            placeholder="e.g. GU-20260122-ABC123"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs text-white/70">
            Email (for guest orders)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <IconSearch size={16} />
          )}
          {loading ? 'Searching...' : 'Track Order'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Tracking Result */}
      {tracking && (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Order</p>
                <p className="text-lg font-semibold text-white">#{tracking.orderNumber}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(tracking.status)}`}>
                {tracking.status?.charAt(0).toUpperCase() + tracking.status?.slice(1)}
              </span>
            </div>
            {tracking.shippingDestination && (
              <p className="mt-2 text-xs text-white/40">
                Shipping to: {tracking.shippingDestination}
              </p>
            )}
          </div>

          {/* Tracking Info */}
          {tracking.trackingNumber && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="mb-1 text-xs text-white/50">Tracking Number</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-white">{tracking.trackingNumber}</p>
                <button onClick={copyTracking} className="text-white/50 hover:text-white" title="Copy">
                  <IconCopy size={14} />
                </button>
                {tracking.trackingUrl && (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-white"
                    title="Track on carrier site"
                  >
                    <IconExternalLink size={14} />
                  </a>
                )}
              </div>
              {tracking.carrier && (
                <p className="mt-1 text-xs text-white/40">via {tracking.carrier}</p>
              )}
              {tracking.estimatedDelivery && (
                <p className="mt-2 text-xs text-white/60">
                  Estimated delivery: {formatDate(tracking.estimatedDelivery)}
                </p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-sm font-medium text-white">Order Timeline</h3>
            <div className="space-y-0">
              {tracking.timeline.map((step, index) => {
                const Icon = getTimelineIcon(step.status);
                const isLast = index === tracking.timeline.length - 1;

                return (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        step.completed ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'
                      }`}>
                        <Icon size={14} />
                      </div>
                      {!isLast && (
                        <div className={`my-1 h-6 w-px ${step.completed ? 'bg-green-500/30' : 'bg-white/10'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${step.completed ? 'text-white' : 'text-white/40'}`}>
                        {step.status}
                      </p>
                      {step.date && (
                        <p className="text-xs text-white/40">{formatDate(step.date)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/contact-us"
              className="text-xs text-white/50 underline underline-offset-2 hover:text-white/70"
            >
              Need help? Contact support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
