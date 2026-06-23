import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuctionContent from './AuctionContent';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Auction interface matching the database schema (Drizzle returns camelCase)
interface Auction {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  videoUrl?: string | null;
  featuredImageIndex?: number;
  startingBid: string;
  currentBid: string;
  reservePrice: string | null;
  bidCount: number;
  bidIncrement?: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended' | 'pending' | 'cancelled' | 'sold' | 'no_sale';
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

async function getAuction(id: string): Promise<Auction | null> {
  try {
    const { auction } = await store.auctions.get(id);
    if (!auction) return null;

    // Map Quickdash auction to local format
    return {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      images: auction.images || [],
      startingBid: auction.startingPrice,
      currentBid: auction.currentBid || auction.startingPrice,
      reservePrice: null,
      bidCount: auction.bidCount || 0,
      startTime: auction.startsAt,
      endTime: auction.endsAt,
      status: auction.status as Auction['status'],
      isActive: auction.status === 'active',
    };
  } catch {
    return null;
  }
}

export default async function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await getAuction(id);

  if (!auction) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      <div className="relative z-10">
        <AuctionContent auction={auction} />
      </div>
      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await getAuction(id);

  if (!auction) {
    return {
      title: 'Auction Not Found',
    };
  }

  return {
    title: `${auction.title} - Gemsutopia Auction`,
    description:
      auction.description || `Bid on ${auction.title}. Starting bid: $${auction.startingBid}`,
    openGraph: {
      title: `${auction.title} - Gemsutopia Auction`,
      description:
        auction.description || `Bid on ${auction.title}. Starting bid: $${auction.startingBid}`,
      images: auction.images?.length > 0 ? [auction.images[auction.featuredImageIndex || 0]] : [],
    },
  };
}
