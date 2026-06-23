'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
          {/* Rotating gem logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/logos/gem2.svg"
              alt=""
              width={800}
              height={800}
              className="h-[150vw] w-[150vw] md:h-[700px] md:w-[700px] lg:h-[900px] lg:w-[900px] animate-[spin_60s_linear_infinite] opacity-[0.08]"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-8 w-full">
            <h1 className="text-7xl sm:text-8xl md:text-9xl text-white font-[family-name:var(--font-cormorant)] font-semibold">500</h1>

            <div className="mt-6 text-center">
              <p className="text-sm sm:text-base text-gray-400 font-[family-name:var(--font-inter)]">Server Error – Something broke on our end.</p>

              <div className="mt-8 flex w-[calc(100vw-4rem)] flex-col gap-4 sm:w-auto sm:flex-row justify-center">
                <button
                  onClick={reset}
                  className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white text-black hover:bg-white/90 flex items-center justify-center whitespace-nowrap"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center whitespace-nowrap"
                >
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
