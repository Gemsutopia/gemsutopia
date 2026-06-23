'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { store } from '@/lib/store';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('_qd_vid');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('_qd_vid', id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('_qd_sid');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('_qd_sid', id);
  }
  return id;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    const visitorId = getOrCreateVisitorId();
    const sessionId = getSessionId();

    store.analytics
      .track({
        sessionId,
        visitorId,
        pathname,
        referrer: document.referrer || undefined,
        hostname: window.location.hostname,
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
