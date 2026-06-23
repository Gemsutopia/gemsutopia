'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';

export default function FloatingWishlistButton() {
  const pathname = usePathname();
  const { itemCount } = useWishlist();

  // Hide on admin pages, wishlist page, checkout, and auth pages
  const hiddenPaths = ['/admin', '/wishlist', '/checkout', '/sign-in', '/sign-up', '/auth'];
  const shouldHide = hiddenPaths.some(path => pathname?.startsWith(path));

  if (shouldHide) return null;

  return (
    <Link
      href="/wishlist"
      className="fixed bottom-6 right-6 z-[100] hidden h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-black shadow-lg shadow-black/50 transition-all duration-200 hover:border-white/30 hover:scale-105 active:scale-95 lg:flex lg:h-14 lg:w-14 xl:bottom-8 xl:right-8"
      aria-label={`Wishlist${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
    >
      {/* Logo */}
      <Image
        src="/logos/logo.png"
        alt="Wishlist"
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
      />

      {/* Badge for item count */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-black lg:h-6 lg:w-6 lg:text-xs">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
