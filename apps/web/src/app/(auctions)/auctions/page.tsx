'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconSearch, IconX, IconChevronDown, IconClock } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyAuctions } from '@/components/empty-states';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/page-loader';
import { useCurrency } from '@/contexts/CurrencyContext';
import { store } from '@/lib/store';

interface Auction {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  featuredImageIndex: number;
  startingBid: string;
  currentBid: string;
  reservePrice: string | null;
  bidCount: number;
  startTime: string;
  endTime: string;
  status: string;
  isActive: boolean;
}

const filterTabs = [
  { value: 'all', label: 'All Auctions' },
  { value: 'active', label: 'Live Now' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'pending', label: 'Upcoming' },
];

const sortOptions = [
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Bid: Low to High' },
  { value: 'price-high', label: 'Bid: High to Low' },
  { value: 'most-bids', label: 'Most Bids' },
];

// Countdown timer component
function CountdownTimer({ endTime, status }: { endTime: string; status: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Set urgent if less than 1 hour
      setIsUrgent(difference < 1000 * 60 * 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (status === 'pending') {
    const date = new Date(endTime);
    return (
      <span className="text-blue-400">
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    );
  }

  if (status === 'ended' || timeLeft === 'Ended') {
    return <span className="text-white/50">Ended</span>;
  }

  return (
    <span className={isUrgent ? 'text-red-400' : 'text-white'}>
      {timeLeft}
    </span>
  );
}

export default function AuctionsPage() {
  const { formatPrice } = useCurrency();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch auctions from Quickdash
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const { auctions: quickdashAuctions } = await store.auctions.list({ limit: 50 });

        // Map to local format
        const mapped: Auction[] = quickdashAuctions.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          images: a.images || [],
          featuredImageIndex: 0,
          startingBid: a.startingPrice,
          currentBid: a.currentBid || a.startingPrice,
          reservePrice: null,
          bidCount: a.bidCount || 0,
          startTime: a.startsAt,
          endTime: a.endsAt,
          status: a.status,
          isActive: a.status === 'active',
        }));
        setAuctions(mapped);
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Check if auction is ending soon (within 1 hour)
  const isEndingSoon = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;
    return difference > 0 && difference < 1000 * 60 * 60;
  };

  // Filter and sort auctions
  const filteredAuctions = auctions
    .filter(auction => {
      // Tab filter
      if (activeTab === 'active' && auction.status !== 'active') return false;
      if (activeTab === 'pending' && auction.status !== 'pending') return false;
      if (activeTab === 'ending-soon' && !isEndingSoon(auction.endTime)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!auction.title.toLowerCase().includes(query)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'ending-soon':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case 'newest':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'price-low':
          return parseFloat(a.currentBid) - parseFloat(b.currentBid);
        case 'price-high':
          return parseFloat(b.currentBid) - parseFloat(a.currentBid);
        case 'most-bids':
          return b.bidCount - a.bidCount;
        default:
          return 0;
      }
    });

  // Get status badge
  const getStatusBadge = (auction: Auction) => {
    if (auction.status === 'active' && isEndingSoon(auction.endTime)) {
      return (
        <div className="absolute top-2 left-2 z-10 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
          Ending Soon
        </div>
      );
    }
    if (auction.status === 'active') {
      return (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
          <span className="relative flex h-1.5 w-1.5 xs:h-2 xs:w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-full w-full rounded-full bg-white"></span>
          </span>
          Live
        </div>
      );
    }
    if (auction.status === 'pending') {
      return (
        <div className="absolute top-2 left-2 z-10 rounded-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
          Upcoming
        </div>
      );
    }
    if (auction.status === 'ended' || auction.status === 'no_sale') {
      return (
        <div className="absolute top-2 left-2 z-10 rounded-md bg-gray-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
          Ended
        </div>
      );
    }
    if (auction.status === 'sold') {
      return (
        <div className="absolute top-2 left-2 z-10 rounded-md bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
          Sold
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="flex-grow px-4 pb-16 pt-28 xs:px-5 xs:pt-32 sm:px-6 md:px-12 md:pt-32 lg:px-24 lg:pb-20 lg:pt-36 xl:px-32 3xl:px-40">
        <div className="mx-auto max-w-7xl 3xl:max-w-[1600px]">
          {/* Page Header */}
          <div className="mb-8 text-center xs:mb-10 md:mb-12">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-3xl font-normal text-white xs:mb-4 xs:text-4xl md:text-5xl lg:text-6xl">
<<<<<<< HEAD
              Gemsutopia Reserve Auctions
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-white/60 xs:text-base md:text-lg">
              Occasional reserve auctions featuring select gemstones, minerals, and collector specimens.
=======
              Reserve Auctions
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-white/60 xs:text-base md:text-lg">
              Bid on rare and unique gemstones. Real-time bidding with live updates.
>>>>>>> bb3ed5ed1183a5b7b1183ac4f0395192fd320452
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex justify-center gap-1.5 xs:mb-8 xs:gap-2">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors xs:px-4 xs:py-2 xs:text-xs sm:px-5 sm:text-sm ${
                  activeTab === tab.value
                    ? 'bg-white text-black'
                    : 'border border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="relative z-[50] mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm xs:mb-8 xs:rounded-3xl xs:p-5 md:mb-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Input */}
              <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
                <IconSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search auctions..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-10 text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none xs:h-11"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                  >
                    <IconX size={16} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white transition-colors hover:border-white/20 xs:h-11"
                >
                  <span className="hidden xs:inline">Sort:</span>
                  <span>{sortOptions.find(opt => opt.value === sortBy)?.label || 'Ending Soon'}</span>
                  <IconChevronDown size={14} className="text-white/60" />
                </button>
                <AnimatePresence>
                  {sortDropdownOpen && (
                    <motion.div
                      className="absolute right-0 top-full z-[999] mt-2"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="min-w-[180px] rounded-xl border border-white/10 bg-black/95 p-2 shadow-xl backdrop-blur-xl">
                        {sortOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setSortDropdownOpen(false);
                            }}
                            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                              sortBy === option.value ? 'text-white' : 'text-white/70'
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Results Count */}
            <p className="mt-3 text-sm text-white/50">
              {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} found
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Auctions Grid */}
          {filteredAuctions.length === 0 ? (
            <EmptyAuctions />
          ) : (
            <div className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
              {filteredAuctions.map(auction => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 xs:rounded-2xl"
                >
                  {/* Auction Image */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-900">
                    {/* Status Badge */}
                    {getStatusBadge(auction)}

                    {/* Bid Count Badge - Top Right */}
                    {auction.bidCount > 0 && (
                      <div className="absolute right-2 top-2 z-10 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
                        {auction.bidCount} bid{auction.bidCount !== 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Ended Overlay */}
                    {(auction.status === 'ended' || auction.status === 'sold' || auction.status === 'no_sale') && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <span className="font-[family-name:var(--font-bacasime)] text-xl tracking-wider text-white xs:text-2xl md:text-3xl">
                          {auction.status === 'sold' ? 'SOLD' : 'ENDED'}
                        </span>
                      </div>
                    )}

                    <Image
                      src={auction.images?.[auction.featuredImageIndex || 0] || auction.images?.[0] || '/images/placeholder.jpg'}
                      alt={auction.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>

                  {/* Auction Info */}
                  <div className="p-2.5 xs:p-3">
                    {/* Title */}
                    <h2 className="text-xs font-semibold text-white xs:text-sm">
                      <span className="xs:hidden">
                        {auction.title.length > 18 ? `${auction.title.slice(0, 18)}...` : auction.title}
                      </span>
                      <span className="hidden xs:inline">
                        {auction.title.length > 24 ? `${auction.title.slice(0, 24)}...` : auction.title}
                      </span>
                    </h2>

                    {/* Price and Time Row */}
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-white xs:text-sm">
                        {formatPrice(parseFloat(auction.currentBid))}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-medium xs:text-xs">
                        <IconClock size={10} className="text-white/50 xs:h-3 xs:w-3" />
                        <CountdownTimer endTime={auction.endTime} status={auction.status} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Breadcrumbs */}
          <div className="mt-10 flex justify-center xs:mt-12 md:mt-16 lg:mt-20">
            <nav className="flex items-center gap-2 text-xs text-white/40 xs:text-sm">
              <a href="/" className="transition-colors hover:text-white/60">Home</a>
              <span>/</span>
              <span className="text-white/60">Auctions</span>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
