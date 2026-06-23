'use client';
import { Suspense } from 'react';
import { useReferralTracking } from '@/hooks/useReferralTracking';

function ReferralTrackerInner() {
  useReferralTracking();
  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerInner />
    </Suspense>
  );
}
