'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCookies } from '@/contexts/CookieContext';
import { IconCookie } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectAll } = useCookies();
  const pathname = usePathname();

  // Hide cookie banner on all admin pages
  if (pathname.startsWith('/admin')) return null;

  if (!showBanner) return null;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/20 bg-black p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white shadow-2xl">
      <div className="mx-auto max-w-7xl">
        <div className="px-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold sm:justify-start">
                <IconCookie size={20} />
                We use cookies
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                We use essential storage to run the shop. With your permission, we also use
                analytics to understand how the site is used. Read our{' '}
                <Link href="/cookies" className="underline hover:text-white">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Mobile: centered full-width buttons like hero. Desktop: row layout */}
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-3 lg:flex-shrink-0">
              <Button
                onClick={acceptAll}
                className="order-first h-10 w-full rounded-md bg-white px-8 font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90 sm:order-last sm:w-auto sm:rounded-lg sm:px-6 sm:text-sm"
              >
                Accept All
              </Button>

              <Button
                variant="outline"
                onClick={rejectAll}
                className="h-10 w-full rounded-md border-transparent bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:w-auto sm:rounded-lg sm:px-6 sm:text-sm"
              >
                Reject All
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
