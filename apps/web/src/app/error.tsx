'use client';

import { useEffect } from 'react';
import ErrorPage, { ERROR_CONFIGS } from '@/components/errors/ErrorPage';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; statusCode?: number };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry
    Sentry.captureException(error);
  }, [error]);

  // Extract status code from error if available
  const statusCode = error.statusCode || 500;
  const config = ERROR_CONFIGS[statusCode] || ERROR_CONFIGS[500];

  return (
    <ErrorPage
      code={statusCode}
      customDescription={error.message !== config.title ? error.message : undefined}
      onRetry={reset}
    />
  );
}
