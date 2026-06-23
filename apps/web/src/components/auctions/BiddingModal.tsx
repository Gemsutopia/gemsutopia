'use client';

import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Auction {
  id: string;
  title: string;
  currentBid: string;
  reservePrice: string | null;
  bidCount: number;
  endTime: string;
  status: string;
  startingBid: string;
  bidIncrement?: string;
}

interface BiddingModalProps {
  auction: Auction;
  isOpen: boolean;
  onClose: () => void;
  onBidPlaced: (newBid: number, reserveMet: boolean) => void;
}

export default function BiddingModal({ auction, isOpen, onClose, onBidPlaced }: BiddingModalProps) {
  const { formatPrice } = useCurrency();
  const bidIncrement = parseFloat(auction.bidIncrement || '1');
  const currentBid = parseFloat(auction.currentBid || '0');
  const startingBid = parseFloat(auction.startingBid || '0');
  const reservePrice = auction.reservePrice ? parseFloat(auction.reservePrice) : null;

  const minBidAmount = auction.bidCount === 0
    ? startingBid
    : currentBid + bidIncrement;

  const [bidInputValue, setBidInputValue] = useState('');
  const [bidderEmail, setBidderEmail] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Parse bid amount from input (empty = 0)
  const bidAmount = bidInputValue ? parseFloat(bidInputValue) : 0;
  const isValidBid = bidAmount >= minBidAmount;
  const reserveMet = reservePrice ? bidAmount >= reservePrice : true;

  // Reset bid input when modal opens
  useEffect(() => {
    if (isOpen) {
      setBidInputValue('');
      setSubmitMessage('');
    }
  }, [isOpen]);

  const isAuctionActive = () => {
    const now = new Date();
    const endTime = new Date(auction.endTime);
    return auction.status === 'active' && endTime > now;
  };

  // Lock body scroll when modal is open (preserve scroll position)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuctionActive()) {
      setSubmitMessage('This auction has ended');
      return;
    }

    if (!bidderEmail || !bidderEmail.includes('@')) {
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    if (!bidderName.trim()) {
      setSubmitMessage('Please enter your name');
      return;
    }

    if (!isValidBid) {
      setSubmitMessage(`Bid must be at least ${formatPrice(minBidAmount)}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch(`/api/auctions/${auction.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bid_amount: bidAmount,
          bidder_email: bidderEmail,
          bidder_name: bidderName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('Bid placed successfully! You are now the highest bidder.');
        onBidPlaced(bidAmount, data.data?.reserveMet || false);
        setTimeout(() => {
          onClose();
          setSubmitMessage('');
          setBidderEmail('');
          setBidderName('');
        }, 2000);
      } else {
        setSubmitMessage(data.error?.message || data.message || 'Failed to place bid. Please try again.');
      }
    } catch {
      setSubmitMessage('Failed to place bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-black p-5 shadow-2xl sm:p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 transition-colors hover:text-white sm:top-4 sm:right-4"
          aria-label="Close modal"
        >
          <IconX size={20} />
        </button>

        {/* Header */}
        <div className="mb-4 text-center sm:mb-6">
          <h3 className="mb-1 font-[family-name:var(--font-cormorant)] text-2xl text-white sm:mb-2 sm:text-3xl">
            Place Your Bid
          </h3>
          <p className="text-xs text-white/60 sm:text-sm">
            Current bid: {formatPrice(currentBid)} · {auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'}
          </p>
        </div>

        {submitMessage && (
          <div
            className={`mb-3 rounded-lg p-2 text-center text-xs sm:mb-4 sm:p-3 sm:text-sm ${
              submitMessage.includes('successfully')
                ? 'border border-green-500/30 bg-green-500/10 text-green-400'
                : 'border border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {submitMessage}
          </div>
        )}

        {!isAuctionActive() ? (
          <div className="py-8 text-center">
            <p className="mb-2 text-lg text-white/70">Auction Has Ended</p>
            <p className="text-sm text-white/40">This auction is no longer accepting bids.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-5">
            {/* Bid Amount - Featured at top */}
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-[220px]">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-lg text-white/50">$</span>
                <input
                  type="number"
                  min={minBidAmount}
                  step="0.01"
                  value={bidInputValue}
                  onChange={(e) => setBidInputValue(e.target.value)}
                  placeholder={minBidAmount.toFixed(2)}
                  className={`w-full rounded-lg border bg-white/5 py-3 pr-4 pl-10 text-center text-2xl font-semibold text-white placeholder-white/30 outline-none transition-colors ${
                    bidInputValue && !isValidBid
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/10 focus:border-white/30'
                  }`}
                />
              </div>
              <p className={`mt-1.5 text-center text-xs ${bidInputValue && !isValidBid ? 'text-red-400' : 'text-white/40'}`}>
                {bidInputValue && !isValidBid
                  ? `Minimum bid is ${formatPrice(minBidAmount)}`
                  : `Minimum: ${formatPrice(minBidAmount)}`
                }
              </p>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="bidder-email" className="text-xs text-white/70 sm:text-sm">
                Email
              </label>
              <input
                type="email"
                id="bidder-email"
                value={bidderEmail}
                onChange={(e) => setBidderEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 sm:px-4 sm:py-3"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="bidder-name" className="text-xs text-white/70 sm:text-sm">
                Your Name
              </label>
              <input
                type="text"
                id="bidder-name"
                value={bidderName}
                onChange={(e) => setBidderName(e.target.value)}
                placeholder="Name"
                maxLength={50}
                required
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 sm:px-4 sm:py-3"
              />
            </div>

            {/* Reserve Status Indicator */}
            {reservePrice && (
              <div className={`flex items-center justify-center gap-2 rounded-lg p-2 text-center text-xs ${
                reserveMet
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
              }`}>
                <span className={`h-2 w-2 rounded-full ${reserveMet ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {reserveMet ? 'Reserve Met' : 'Reserve Not Met'}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !isValidBid || !bidderEmail.includes('@') || !bidderName.trim()}
              className={`h-10 w-full rounded-lg px-8 font-[family-name:var(--font-inter)] text-sm transition-all duration-200 sm:h-11 sm:text-base ${
                isSubmitting || !isValidBid || !bidderEmail.includes('@') || !bidderName.trim()
                  ? 'cursor-not-allowed bg-white/20 text-white/50'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {isSubmitting ? 'Placing Bid...' : `Place Bid · ${bidAmount > 0 ? formatPrice(bidAmount) : formatPrice(minBidAmount)}`}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
