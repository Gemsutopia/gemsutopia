'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import ErrorPage from '@/components/errors/ErrorPage';

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
        <ErrorPage code={500} onRetry={reset} errorId={error.digest} />
      </body>
    </html>
  );
}
