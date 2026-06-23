'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const REFERRAL_STORAGE_KEY = 'referralCode';
const REFERRAL_EXPIRY_DAYS = 30;

export function useReferralTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for referral code in URL
    const refCode = searchParams.get('ref');

    if (refCode) {
      // Store the referral code with an expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS);

      const referralData = {
        code: refCode.toUpperCase(),
        storedAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString(),
      };

      localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralData));
    }
  }, [searchParams]);
}

export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!stored) return null;

  try {
    const data = JSON.parse(stored);

    // Check if expired
    if (new Date(data.expiresAt) < new Date()) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }

    return data.code;
  } catch {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    return null;
  }
}

export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
}
