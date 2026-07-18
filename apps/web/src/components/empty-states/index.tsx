import Link from 'next/link';
import { IconDiamond } from '@tabler/icons-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// Base Empty State Component
export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-12 text-center sm:px-10 sm:py-14">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60">
        <IconDiamond size={20} stroke={1.5} />
      </div>
      <h2 className="mb-3 font-[family-name:var(--font-bacasime)] text-3xl text-white md:text-4xl">{title}</h2>
      <p className="mb-8 max-w-sm text-sm leading-6 text-white/50 sm:text-base">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/90 sm:w-auto"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/90 sm:w-auto"
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-6 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-6 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </section>
  );
}

// Empty Cart
export function EmptyCart() {
  return (
    <EmptyState
      title="Your Gem Pouch is Empty"
      description="Looks like you haven't added any gems yet. Start exploring our collection!"
      action={{ label: 'Browse Shop', href: '/shop' }}
      secondaryAction={{ label: 'View Auctions', href: '/auctions' }}
    />
  );
}

// Empty Wishlist
export function EmptyWishlist() {
  return (
    <EmptyState
      title="No Saved Items"
      description="Save your favorite gems to keep track of them and get notified about price changes."
      action={{ label: 'Explore Gems', href: '/shop' }}
    />
  );
}

// Empty Orders
export function EmptyOrders() {
  return (
    <EmptyState
      title="No Orders Yet"
      description="When you make a purchase, your order history will appear here."
      action={{ label: 'Start Shopping', href: '/shop' }}
    />
  );
}

// Empty Search Results
export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      title="No Results Found"
      description={
        query
          ? `We couldn't find any gems matching "${query}". Try different keywords.`
          : "We couldn't find any results. Try adjusting your search or filters."
      }
      action={{ label: 'Clear Filters', href: '/shop' }}
      secondaryAction={{ label: 'Browse All', href: '/shop' }}
    />
  );
}

// Empty Products (category)
export function EmptyProducts({ category }: { category?: string }) {
  return (
    <EmptyState
      title={category ? `No ${category} Available` : 'No Products Available'}
      description="Check back soon! We're always adding new gems to our collection."
      action={{ label: 'Browse Other Categories', href: '/shop' }}
    />
  );
}

// Empty Auctions
export function EmptyAuctions() {
  return (
    <EmptyState
      title="Next Auction Coming Soon"
      description="We periodically host reserve auctions for select Gemsutopia pieces. Browse the shop or follow our socials to be notified when the next auction goes live."
      action={{ label: 'Browse Shop', href: '/shop' }}
    />
  );
}

// Empty Reviews
export function EmptyReviews() {
  return (
    <EmptyState
      title="No Reviews Yet"
      description="Be the first to share your experience with this product!"
    />
  );
}

// Empty Notifications
export function EmptyNotifications() {
  return (
    <EmptyState
      title="All Caught Up!"
      description="You don't have any notifications right now."
    />
  );
}

// Empty Bids
export function EmptyBids() {
  return (
    <EmptyState
      title="No Bids Yet"
      description="Be the first to place a bid on this auction!"
    />
  );
}

// Generic Empty State for Admin Tables
export function EmptyTable({ resourceName }: { resourceName: string }) {
  return (
    <EmptyState
      title={`No ${resourceName}`}
      description={`There are no ${resourceName.toLowerCase()} to display.`}
    />
  );
}

// Offline State
export function OfflineState() {
  return (
    <EmptyState
      title="You're Offline"
      description="Please check your internet connection and try again."
      action={{ label: 'Retry', onClick: () => window.location.reload() }}
    />
  );
}

export function LoadError({
  message = 'We could not load this content right now.',
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      title="Unable to Load"
      description={message}
      action={{ label: 'Try Again', onClick: onRetry }}
      secondaryAction={{ label: 'Return Home', href: '/' }}
    />
  );
}

// Maintenance State
export function MaintenanceState() {
  return (
    <EmptyState
      title="Under Maintenance"
      description="We're making some improvements. Please check back soon!"
    />
  );
}
