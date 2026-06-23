'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Bid {
  id: string;
  amount: string;
  bidderName: string;
  bidderEmail: string;
  isWinning: boolean;
  status: string;
  createdAt: string;
}

interface BidHistoryProps {
  auctionId: string;
  bidCount: number;
}

export default function BidHistory({ auctionId, bidCount }: BidHistoryProps) {
  const { formatPrice } = useCurrency();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await fetch(`/api/auctions/${auctionId}/bid?limit=20`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.bids) {
            setBids(data.data.bids);
          }
        }
      } catch {
        // Silently fail - bid history is not critical
      } finally {
        setLoading(false);
      }
    };

    if (bidCount > 0) {
      fetchBids();
    } else {
      setLoading(false);
    }
  }, [auctionId, bidCount]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (bidCount === 0) {
    return (
      <div className="rounded-lg bg-white/5 p-5 xs:rounded-xl xs:p-6">
        <p className="text-center font-[family-name:var(--font-inter)] text-sm text-white/50">
          No bids yet. Be the first to bid!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-white/5 p-5 xs:rounded-xl xs:p-6">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          <span className="font-[family-name:var(--font-inter)] text-sm text-white/50">
            Loading bid history...
          </span>
        </div>
      </div>
    );
  }

  const displayedBids = expanded ? bids : bids.slice(0, 5);

  return (
    <div className="rounded-lg bg-white/5 xs:rounded-xl">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 xs:px-6 sm:px-8">
        <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
          {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
        </span>
        <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
          Amount
        </span>
      </div>

      {/* Bids list */}
      <div className="divide-y divide-white/5">
        {displayedBids.map((bid, index) => (
          <div
            key={bid.id}
            className={`flex items-center justify-between px-5 py-3 xs:px-6 sm:px-8 ${
              bid.isWinning ? 'bg-emerald-500/5' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar/Badge */}
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                bid.isWinning
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/10 text-white/60'
              }`}>
                {bid.isWinning ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>
                ) : (
                  <span>{bid.bidderName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Bidder info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-[family-name:var(--font-inter)] text-sm ${
                    bid.isWinning ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {bid.bidderName}
                  </span>
                  {bid.isWinning && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                      Winning
                    </span>
                  )}
                  {index === 0 && !bid.isWinning && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                      Latest
                    </span>
                  )}
                </div>
                <span className="font-[family-name:var(--font-inter)] text-xs text-white/40">
                  {formatTime(bid.createdAt)}
                </span>
              </div>
            </div>

            {/* Bid amount */}
            <span className={`font-[family-name:var(--font-inter)] text-sm font-medium ${
              bid.isWinning ? 'text-emerald-400' : 'text-white'
            }`}>
              {formatPrice(parseFloat(bid.amount))}
            </span>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {bids.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full border-t border-white/5 py-3 text-center font-[family-name:var(--font-inter)] text-xs text-white/50 transition-colors hover:text-white xs:text-sm"
        >
          {expanded ? 'Show Less' : `Show All ${bids.length} Bids`}
        </button>
      )}
    </div>
  );
}
