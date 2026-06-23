import Link from 'next/link';

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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center w-full">
      <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4 font-[family-name:var(--font-bacasime)]">{title}</h1>
      <p className="text-gray-400 max-w-sm mb-8">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex w-[calc(100vw-4rem)] flex-col gap-4 sm:w-auto sm:flex-row justify-center">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white text-black hover:bg-white/90 flex items-center justify-center whitespace-nowrap"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white text-black hover:bg-white/90 flex items-center justify-center whitespace-nowrap"
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center whitespace-nowrap"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center whitespace-nowrap"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
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

// Maintenance State
export function MaintenanceState() {
  return (
    <EmptyState
      title="Under Maintenance"
      description="We're making some improvements. Please check back soon!"
    />
  );
}
