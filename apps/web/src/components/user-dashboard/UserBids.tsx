'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faFilter,
  faSpinner,
  faTrophy,
  faClock,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';

interface Auction {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  currentBid: number;
  startingBid: number;
  currency: string;
  endTime: string;
  status: string;
  isActive: boolean;
  bidCount: number;
}

interface Bid {
  id: string;
  amount: number;
  maxBid: number | null;
  isAutoBid: boolean;
  isWinning: boolean;
  createdAt: string;
  auction: Auction;
  userStatus: 'winning' | 'outbid' | 'won' | 'lost' | 'pending';
}

interface BidStats {
  totalBids: number;
  activeBids: number;
  wonAuctions: number;
  currentlyWinning: number;
}

export default function UserBids() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [bids, setBids] = useState<Bid[]>([]);
  const [stats, setStats] = useState<BidStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/bids/user');
      const data = await response.json();

      if (data.success) {
        setBids(data.data.bids);
        setStats(data.data.stats);
      } else {
        setError(data.error?.message || 'Failed to fetch bids');
      }
    } catch {
      setError('Failed to load bids');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winning':
        return 'bg-green-100 text-green-800';
      case 'won':
        return 'bg-purple-100 text-purple-800';
      case 'outbid':
        return 'bg-orange-100 text-orange-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'winning':
        return faArrowUp;
      case 'won':
        return faTrophy;
      case 'outbid':
        return faArrowDown;
      case 'lost':
        return faArrowDown;
      default:
        return faClock;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredBids =
    filterStatus === 'all'
      ? bids
      : bids.filter(bid => {
          switch (filterStatus) {
            case 'active':
              return bid.auction.status === 'active';
            case 'winning':
              return bid.userStatus === 'winning';
            case 'won':
              return bid.userStatus === 'won';
            case 'lost':
              return bid.userStatus === 'lost' || bid.userStatus === 'outbid';
            default:
              return true;
          }
        });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="mb-4 h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading your bids...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="mb-4 text-red-800">{error}</p>
        <button
          onClick={fetchBids}
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
        <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>

        {/* Filter */}
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="all">All Bids</option>
            <option value="active">Active Auctions</option>
            <option value="winning">Currently Winning</option>
            <option value="won">Won</option>
            <option value="lost">Outbid / Lost</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600">Total Bids</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-blue-600">{stats.activeBids}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600">Winning</p>
            <p className="text-2xl font-bold text-green-600">{stats.currentlyWinning}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600">Won</p>
            <p className="text-2xl font-bold text-purple-600">{stats.wonAuctions}</p>
          </div>
        </div>
      )}

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <div className="rounded-lg bg-white py-12 text-center shadow-md">
            <FontAwesomeIcon icon={faGavel} className="mb-4 text-4xl text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No bids found</h3>
            <p className="mb-6 text-gray-600">
              {filterStatus === 'all'
                ? "You haven't placed any bids yet."
                : `No ${filterStatus} bids found.`}
            </p>
            <Link
              href="/auctions"
              className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
            >
              Browse Auctions
            </Link>
          </div>
        ) : (
          filteredBids.map(bid => (
            <div key={bid.id} className="overflow-hidden rounded-lg bg-white shadow-md">
              <div className="flex flex-col sm:flex-row">
                {/* Auction Image */}
                <div className="relative h-48 w-full sm:h-auto sm:w-48">
                  {bid.auction.image ? (
                    <Image
                      src={bid.auction.image}
                      alt={bid.auction.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <FontAwesomeIcon icon={faGavel} className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Bid Details */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{bid.auction.title}</h3>
                      <p className="text-sm text-gray-600">
                        {bid.auction.bidCount} bid{bid.auction.bidCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span
                      className={`flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(bid.userStatus)}`}
                    >
                      <FontAwesomeIcon icon={getStatusIcon(bid.userStatus)} className="h-3 w-3" />
                      <span>{bid.userStatus}</span>
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Your Bid</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(bid.amount, bid.auction.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current Bid</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(bid.auction.currentBid, bid.auction.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time Left</p>
                      <p className={`font-semibold ${bid.auction.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                        {bid.auction.status === 'active' ? getTimeRemaining(bid.auction.endTime) : 'Ended'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bid Placed</p>
                      <p className="text-sm text-gray-600">{formatDate(bid.createdAt)}</p>
                    </div>
                  </div>

                  {bid.maxBid && (
                    <p className="mb-4 text-sm text-gray-600">
                      Max auto-bid: {formatCurrency(bid.maxBid, bid.auction.currency)}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/auctions/${bid.auction.id}`}
                      className="rounded-lg border border-purple-600 px-4 py-2 text-sm text-purple-600 transition-colors hover:bg-purple-50"
                    >
                      View Auction
                    </Link>
                    {bid.userStatus === 'outbid' && bid.auction.status === 'active' && (
                      <Link
                        href={`/auctions/${bid.auction.id}`}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
                      >
                        Place New Bid
                      </Link>
                    )}
                    {bid.userStatus === 'won' && (
                      <Link
                        href={`/checkout?auction=${bid.auction.id}`}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                      >
                        Complete Purchase
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
