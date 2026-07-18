'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { store } from '@/lib/store';
import { useCookies } from '@/contexts/CookieContext';

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
  const { hasConsented, preferences } = useCookies();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (!hasConsented || !preferences.analytics || pathname === lastPathRef.current) return;
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
  }, [hasConsented, pathname, preferences.analytics]);

  return null;
}
