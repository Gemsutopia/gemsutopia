'use client';
import { useState, useEffect } from 'react';
import {
  IconClock,
  IconGavel,
  IconCurrencyDollar,
  IconUsers,
  IconAlertCircle,
} from '@tabler/icons-react';

interface Auction {
  id: string;
  title: string;
  current_bid: number;
  starting_bid: number;
  reserve_price: number | null;
  bid_count: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'ended' | 'pending' | 'cancelled';
  is_active: boolean;
}

interface AuctionBiddingProps {
  auction: Auction;
  onAuctionUpdate: (auction: Auction) => void;
}

export default function AuctionBidding({ auction, onAuctionUpdate }: AuctionBiddingProps) {
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate minimum bid (current bid + increment)
  const minBidIncrement =
    auction.current_bid < 100
      ? 5
      : auction.current_bid < 500
        ? 10
        : auction.current_bid < 1000
          ? 25
          : 50;
  const minimumBid = auction.current_bid + minBidIncrement;

  // Initialize bid amount to minimum bid
  useEffect(() => {
    setBidAmount(minimumBid);
  }, [minimumBid]);

  // Update countdown timer
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(auction.end_time).getTime();
      const timeDiff = endTime - now;

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft('Ended');
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auction.end_time]);

  const handleSubmitBid = async () => {
    if (bidAmount < minimumBid) {
      setError(`Bid must be at least $${minimumBid.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Implement bid submission to API
      // For now, just simulate success
      setTimeout(() => {
        setIsSubmitting(false);
        // Update auction with new bid (simulated)
        const updatedAuction = {
          ...auction,
          current_bid: bidAmount,
          bid_count: auction.bid_count + 1,
        };
        onAuctionUpdate(updatedAuction);
        setBidAmount(bidAmount + minBidIncrement); // Update for next bid
      }, 1000);
    } catch {
      setError('Failed to place bid. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    switch (auction.status) {
      case 'active':
        return 'text-green-400 bg-green-500/20';
      case 'ended':
        return 'text-red-400 bg-red-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'cancelled':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const isAuctionActive = auction.status === 'active' && timeLeft !== 'Ended';
  const hasReserve = auction.reserve_price && auction.current_bid < auction.reserve_price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
        {/* Auction Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconGavel size={32} className="text-white" />
            <h2 className="text-2xl font-bold text-white">Live Auction</h2>
          </div>

          <div className={`rounded-lg px-4 py-2 text-sm font-medium ${getStatusColor()}`}>
            {auction.status === 'active'
              ? 'Live'
              : auction.status === 'ended'
                ? 'Ended'
                : auction.status === 'pending'
                  ? 'Starting Soon'
                  : 'Cancelled'}
          </div>
        </div>

        {/* Auction Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Current Bid */}
          <div className="rounded-xl bg-white/30 p-4 text-center">
            <IconCurrencyDollar size={24} className="mx-auto mb-2 text-green-400" />
            <p className="text-sm text-gray-400">Current Bid</p>
            <p className="text-2xl font-bold text-white">${auction.current_bid.toFixed(2)}</p>
          </div>

          {/* Bid Count */}
          <div className="rounded-xl bg-white/30 p-4 text-center">
            <IconUsers size={24} className="mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-gray-400">Total Bids</p>
            <p className="text-2xl font-bold text-white">{auction.bid_count}</p>
          </div>

          {/* Time Left */}
          <div className="rounded-xl bg-white/30 p-4 text-center">
            <IconClock size={24} className="mx-auto mb-2 text-yellow-400" />
            <p className="text-sm text-gray-400">Time Left</p>
            <p className="text-2xl font-bold text-white">{timeLeft}</p>
          </div>

          {/* Starting Bid */}
          <div className="rounded-xl bg-white/30 p-4 text-center">
            <IconGavel size={24} className="mx-auto mb-2 text-purple-400" />
            <p className="text-sm text-gray-400">Starting Bid</p>
            <p className="text-2xl font-bold text-white">${auction.starting_bid.toFixed(2)}</p>
          </div>
        </div>

        {/* Reserve Notice */}
        {hasReserve && (
          <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/20 p-4">
            <div className="flex items-center gap-2">
              <IconAlertCircle size={20} className="text-orange-400" />
              <p className="text-orange-200">
                Reserve price has not been met. Current bid must reach $
                {auction.reserve_price?.toFixed(2)} to win.
              </p>
            </div>
          </div>
        )}

        {/* Bidding Section */}
        {isAuctionActive ? (
          <div className="rounded-xl bg-white/20 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Place Your Bid</h3>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Bid Amount (minimum ${minimumBid.toFixed(2)})
                </label>
                <div className="relative">
                  <IconCurrencyDollar
                    size={20}
                    className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                  />
                  <input
                    type="number"
                    min={minimumBid}
                    step="0.01"
                    value={bidAmount}
                    onChange={e => setBidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 py-3 pr-4 pl-10 text-white placeholder-gray-400 focus:border-white/40 focus:outline-none"
                    placeholder={`${minimumBid.toFixed(2)}`}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitBid}
                disabled={isSubmitting || bidAmount < minimumBid}
                className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-500/20 p-6 text-center">
            <p className="text-lg text-gray-300">
              {auction.status === 'ended'
                ? 'This auction has ended'
                : auction.status === 'pending'
                  ? 'This auction has not started yet'
                  : 'Bidding is not available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
