'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IconBrandPaypal,
  IconCheck,
  IconLoader2,
  IconLock,
  IconMail,
  IconShieldCheck,
  IconTestPipe,
} from '@tabler/icons-react';
import { useMode } from '@/lib/contexts/ModeContext';
import { store } from '@/lib/store';

interface PaymentMethodsProps {
  onSelect: (method: 'paypal') => void;
}

export default function PaymentMethods({ onSelect }: PaymentMethodsProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paypalAvailable, setPaypalAvailable] = useState(false);
  const [paypalIsTest, setPaypalIsTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const { mode: siteMode } = useMode();
  const isSandbox = siteMode === 'sandbox';

  useEffect(() => {
    const fetchPayPal = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const response = await store.payments.getMethods();
        const paypal = response.methods.find(method => method.provider === 'paypal');
        setPaypalAvailable(Boolean(paypal));
        setPaypalIsTest(paypal?.testMode === true || paypal?.mode === 'sandbox');
      } catch {
        setPaypalAvailable(false);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPayPal();
  }, [retryKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 size={24} className="animate-spin text-white/60" />
        <span className="ml-2 text-sm text-white/60">Loading PayPal...</span>
      </div>
    );
  }

  if (!paypalAvailable) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm text-white/60">
          PayPal is temporarily unavailable. Please try again later or contact support.
        </p>
        {loadError && (
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="mt-4 text-sm text-white underline underline-offset-4"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isSandbox && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
          <IconTestPipe size={16} className="shrink-0 text-amber-400" />
          <p className="text-xs text-amber-300">Sandbox mode — no real charge will be made.</p>
        </div>
      )}

      <div className="rounded-xl border border-white/30 bg-white/10 p-4 xs:p-5">
        <div className="flex items-center gap-4">
          <IconBrandPaypal size={26} className="text-white" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white">PayPal</span>
              {paypalIsTest && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
                  Test
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/45">Pay with PayPal or an eligible card</p>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
            <IconCheck size={14} className="text-black" />
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 xs:p-4">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={event => setAgreedToTerms(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-white"
        />
        <span className="text-xs text-white/70 xs:text-sm">
          I agree to the{' '}
          <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-white">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/refund-policy" target="_blank" className="underline underline-offset-2 hover:text-white">
            Refund Policy
          </Link>
        </span>
      </label>

      <button
        onClick={() => onSelect('paypal')}
        disabled={!agreedToTerms}
        className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50 xs:text-base"
      >
        {agreedToTerms ? 'Continue with PayPal' : 'Accept terms to continue'}
      </button>

      <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-white/50">
        <div className="flex items-center gap-2"><IconLock size={14} /> Secure PayPal checkout</div>
        <div className="flex items-center gap-2"><IconShieldCheck size={14} /> Your payment details stay with PayPal</div>
        <div className="flex items-center gap-2"><IconMail size={14} /> Need help? support@gemsutopia.ca</div>
      </div>
    </div>
  );
}
