'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCookies } from '@/contexts/CookieContext';
import { IconX, IconCookie } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, dismissBanner } = useCookies();
  const [showDetails, setShowDetails] = useState(false);
  const pathname = usePathname();

  // Hide cookie banner on all admin pages
  if (pathname.startsWith('/admin')) return null;

  if (!showBanner) return null;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/20 bg-black p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white shadow-2xl">
      <div className="mx-auto max-w-7xl">
        {/* Close button */}
        <button
          onClick={dismissBanner}
          className="absolute top-4 right-4 text-white transition-colors hover:text-gray-300"
          aria-label="Close cookie banner"
        >
          <IconX size={20} />
        </button>

        <div className="px-2 sm:pr-12 sm:pl-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold sm:justify-start">
                <IconCookie size={20} />
                We use cookies
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                We use cookies to enhance your browsing experience, provide personalized content,
                and analyze our traffic. By clicking &ldquo;Accept All&rdquo;, you consent to our
                use of cookies.
              </p>

              {showDetails && (
                <div className="mt-4 space-y-2 text-xs text-gray-400">
                  <p>
                    <strong>Essential:</strong> Required for basic functionality (always active)
                  </p>
                  <p>
                    <strong>Analytics:</strong> Help us improve our website performance
                  </p>
                  <p>
                    <strong>Marketing:</strong> Show you relevant ads and measure campaigns
                  </p>
                  <p>
                    <strong>Functional:</strong> Remember your preferences and settings
                  </p>
                </div>
              )}
            </div>

            {/* Mobile: centered full-width buttons like hero. Desktop: row layout */}
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-3 lg:flex-shrink-0">
              <Button
                onClick={acceptAll}
                className="order-first h-10 w-full rounded-md bg-white px-8 font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90 sm:order-last sm:w-auto sm:rounded-lg sm:px-6 sm:text-sm"
              >
                Accept All
              </Button>

              <Link href="/cookie-settings" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-10 w-full rounded-md border-transparent bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:w-auto sm:rounded-lg sm:px-6 sm:text-sm"
                >
                  Customize
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={rejectAll}
                className="h-10 w-full rounded-md border-transparent bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:w-auto sm:rounded-lg sm:px-6 sm:text-sm"
              >
                Reject All
              </Button>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="order-last text-sm text-white/60 underline transition-colors hover:text-white sm:order-first"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
