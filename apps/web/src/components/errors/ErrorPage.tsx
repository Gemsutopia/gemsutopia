'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconHome, IconRefresh } from '@tabler/icons-react';

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
  customTitle,
  customDescription,
  errorId,
  onRetry,
}: ErrorPageProps) {
  const config = ERROR_CONFIGS[code] || ERROR_CONFIGS[500];
  const router = useRouter();
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const canRetry = Boolean(onRetry) || ![401, 403, 404, 410].includes(code);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-24 text-white">
      <section className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-center shadow-2xl shadow-black/50 backdrop-blur-md sm:p-10">
        <p className="mb-5 font-[family-name:var(--font-inter)] text-xs font-medium tracking-[0.24em] text-white/40 uppercase">
          Error {code}
        </p>
        <h1 className="font-[family-name:var(--font-bacasime)] text-4xl text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md font-[family-name:var(--font-inter)] text-sm leading-6 text-white/55 sm:text-base">
          {description}
        </p>
        {errorId && (
          <p className="mt-4 font-mono text-xs text-white/30">Reference: {errorId}</p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {code === 401 ? (
              <Link
                href="/sign-in"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/90 sm:w-auto"
              >
                Sign in
              </Link>
            ) : code === 403 || code === 404 || code === 410 ? (
              <button
                onClick={() => router.back()}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/90 sm:w-auto"
              >
                <IconArrowLeft size={17} /> Go back
              </button>
            ) : canRetry ? (
              <button
                onClick={handleRetry}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/90 sm:w-auto"
              >
                <IconRefresh size={17} /> Try again
              </button>
            ) : null}
            <Link
              href="/"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-6 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              <IconHome size={17} /> Home
            </Link>
        </div>
      </section>
    </main>
  );
}
