'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface ErrorConfig {
  code: number;
  title: string;
  description: string;
}

export const ERROR_CONFIGS: Record<number, ErrorConfig> = {
  400: {
    code: 400,
    title: 'Bad Request',
    description: "We couldn't process that request.",
  },
  401: {
    code: 401,
    title: 'Unauthorized',
    description: 'Please sign in to continue.',
  },
  403: {
    code: 403,
    title: 'Forbidden',
    description: "You don't have access to this page.",
  },
  404: {
    code: 404,
    title: 'Not Found',
    description: "This page doesn't exist.",
  },
  405: {
    code: 405,
    title: 'Method Not Allowed',
    description: "That action isn't supported here.",
  },
  408: {
    code: 408,
    title: 'Request Timeout',
    description: 'The connection timed out.',
  },
  409: {
    code: 409,
    title: 'Conflict',
    description: 'Something changed while you were working.',
  },
  410: {
    code: 410,
    title: 'Gone',
    description: 'This content has been removed.',
  },
  429: {
    code: 429,
    title: 'Too Many Requests',
    description: 'Slow down, try again in a moment.',
  },
  500: {
    code: 500,
    title: 'Server Error',
    description: "Something broke on our end.",
  },
  502: {
    code: 502,
    title: 'Bad Gateway',
    description: "We're having trouble connecting.",
  },
  503: {
    code: 503,
    title: 'Unavailable',
    description: "We're down for maintenance.",
  },
  504: {
    code: 504,
    title: 'Gateway Timeout',
    description: 'The server took too long.',
  },
};

interface ErrorPageProps {
  code: number;
  customTitle?: string;
  customDescription?: string;
  errorId?: string;
  onRetry?: () => void;
}

export default function ErrorPage({
  code,
}: ErrorPageProps) {
  const config = ERROR_CONFIGS[code] || ERROR_CONFIGS[500];

  return (
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
        <h1 className="text-7xl sm:text-8xl md:text-9xl text-white font-[family-name:var(--font-cormorant)] font-semibold">{code}</h1>

        <div className="mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-400 font-[family-name:var(--font-inter)]">{config.title} – {config.description}</p>

          <div className="mt-8 flex w-[calc(100vw-4rem)] flex-col gap-4 sm:w-auto sm:flex-row justify-center">
            {code === 401 ? (
              <Link
                href="/sign-in"
                className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white text-black hover:bg-white/90 flex items-center justify-center whitespace-nowrap"
              >
                Log In
              </Link>
            ) : code === 403 || code === 404 ? (
              <button
                onClick={() => window.history.back()}
                className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white text-black hover:bg-white/90 flex items-center justify-center whitespace-nowrap"
              >
                Go Back
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg bg-white text-black hover:bg-white/90 flex items-center justify-center whitespace-nowrap"
              >
                Try Again
              </button>
            )}
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
  );
}
