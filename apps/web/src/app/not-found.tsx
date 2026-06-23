'use client';

import ErrorPage from '@/components/errors/ErrorPage';

export default function NotFound() {
  return <ErrorPage code={404} />;
}
