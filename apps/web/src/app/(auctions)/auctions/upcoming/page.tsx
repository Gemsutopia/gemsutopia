import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { EmptyAuctions } from '@/components/empty-states';
import { store } from '@/lib/store';
import { IconClock } from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

export default async function UpcomingAuctions() {
  const { auctions } = await store.auctions.list({ status: 'scheduled', sort: 'startsAt', order: 'asc' });

  // Map Quickdash auctions to local format
  const mappedAuctions = auctions.map((auction) => ({
    id: auction.id,
    title: auction.title,
    description: auction.description,
    images: auction.images || [],
    startingBid: auction.startingPrice,
    currentBid: auction.currentBid || auction.startingPrice,
    bidCount: auction.bidCount || 0,
    startTime: auction.startsAt,
    endTime: auction.endsAt,
    status: auction.status,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="flex-grow px-4 pb-16 pt-28 xs:px-5 xs:pt-32 sm:px-6 md:px-12 md:pt-32 lg:px-24 lg:pb-20 lg:pt-36 xl:px-32 3xl:px-40">
        <div className="mx-auto max-w-7xl 3xl:max-w-[1600px]">
          {/* Page Header */}
          <div className="mb-8 text-center xs:mb-10 md:mb-12">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-3xl font-normal text-white xs:mb-4 xs:text-4xl md:text-5xl lg:text-6xl">
              Upcoming Auctions
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-white/60 xs:text-base md:text-lg">
              Preview upcoming auctions and get notified when they go live.
            </p>
          </div>

          {/* Auctions Grid */}
          {mappedAuctions.length === 0 ? (
            <EmptyAuctions />
          ) : (
            <div className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
              {mappedAuctions.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 xs:rounded-2xl"
                >
                  {/* Auction Image */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-900">
                    {/* Upcoming Badge */}
                    <div className="absolute top-2 left-2 z-10 rounded-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
                      Upcoming
                    </div>

                    <Image
                      src={auction.images?.[0] || '/images/placeholder.jpg'}
                      alt={auction.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>

                  {/* Auction Info */}
                  <div className="p-2.5 xs:p-3">
                    <h2 className="text-xs font-semibold text-white xs:text-sm">
                      <span className="xs:hidden">
                        {auction.title.length > 18 ? `${auction.title.slice(0, 18)}...` : auction.title}
                      </span>
                      <span className="hidden xs:inline">
                        {auction.title.length > 24 ? `${auction.title.slice(0, 24)}...` : auction.title}
                      </span>
                    </h2>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-white xs:text-sm">
                        Starting at ${parseFloat(auction.startingBid).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-blue-400 xs:text-xs">
                        <IconClock size={10} className="xs:h-3 xs:w-3" />
                        {new Date(auction.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
