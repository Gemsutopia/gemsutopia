'use client';
import { useState, useEffect } from 'react';
import { IconCreditCard, IconBrandPaypal, IconWallet, IconCurrencyBitcoin, IconBuildingStore, IconSquare, IconCheck, IconLock, IconShieldCheck, IconMail, IconLoader2, IconTestPipe } from '@tabler/icons-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useMode } from '@/lib/contexts/ModeContext';
import { store } from '@/lib/store';
import Link from 'next/link';

type PaymentMethodType = 'stripe' | 'paypal' | 'polar' | 'reown' | 'shopify' | 'square';

interface PaymentMethodsProps {
  onSelect: (method: PaymentMethodType) => void;
}

const PROVIDER_META: Record<string, { name: string; icon: typeof IconCreditCard; description?: string }> = {
  stripe: { name: 'Credit or Debit', icon: IconCreditCard },
  paypal: { name: 'PayPal', icon: IconBrandPaypal, description: 'PayPal balance, Venmo, or card' },
  polar: { name: 'Polar', icon: IconWallet, description: 'Secure card payments' },
  reown: { name: 'Crypto', icon: IconCurrencyBitcoin, description: 'BTC, ETH, SOL & more' },
  shopify: { name: 'Shopify', icon: IconBuildingStore },
  square: { name: 'Square', icon: IconSquare },
};

export default function PaymentMethods({ onSelect }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [methods, setMethods] = useState<{ provider: string; type: string; testMode?: boolean; mode?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const { mode: siteMode } = useMode();
  const isSandbox = siteMode === 'sandbox';

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await store.payments.getMethods();
        setMethods(res.methods);
      } catch {
        // Fallback: show nothing, user can't proceed
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 size={24} className="animate-spin text-white/60" />
        <span className="ml-2 font-[family-name:var(--font-inter)] text-sm text-white/60">Loading payment methods...</span>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
          No payment methods are currently available. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isSandbox && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
          <IconTestPipe size={16} className="shrink-0 text-amber-400" />
          <p className="font-[family-name:var(--font-inter)] text-xs text-amber-300">
            Sandbox mode — use test card numbers. No real charges will be made.
          </p>
        </div>
      )}
      {methods.map(method => {
        const meta = PROVIDER_META[method.provider] || { name: method.provider, icon: IconWallet };
        const Icon = meta.icon;
        const id = method.provider as PaymentMethodType;
        const isSelected = selectedMethod === id;
        const isProviderTest = method.testMode === true || method.mode === 'sandbox';

        return (
          <button
            key={id}
            onClick={() => setSelectedMethod(id)}
            className={`group relative w-full rounded-xl border p-4 text-left transition-all xs:p-5 ${
              isSelected
                ? 'border-white/30 bg-white/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <Icon size={24} className="text-white" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-inter)] text-base font-semibold text-white">
                    {meta.name}
                  </span>
                  {isProviderTest && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-[family-name:var(--font-inter)] text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      Test
                    </span>
                  )}
                </div>
                {meta.description && (
                  <p className="font-[family-name:var(--font-inter)] text-xs text-white/40 mt-0.5">
                    {meta.description}
                  </p>
                )}
              </div>
              {isSelected && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <IconCheck size={14} className="text-black" />
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Terms Agreement */}
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 xs:p-4">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-white"
        />
        <span className="font-[family-name:var(--font-inter)] text-xs text-white/70 xs:text-sm">
          I agree to the{' '}
          <Link href="/terms-of-service" target="_blank" className="underline underline-offset-2 hover:text-white">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/refund-policy" target="_blank" className="underline underline-offset-2 hover:text-white">
            Refund Policy
          </Link>
        </span>
      </label>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!selectedMethod || !agreedToTerms}
        className="mt-4 h-10 w-full rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50 xs:h-11 xs:text-base"
      >
        {!selectedMethod ? 'Select a payment method' : !agreedToTerms ? 'Accept terms to continue' : 'Continue'}
      </button>

      {/* Trust Signals */}
      <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-white/50">
          <IconLock size={14} />
          <span className="font-[family-name:var(--font-inter)] text-xs">
            256-bit SSL encrypted checkout
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <IconShieldCheck size={14} />
          <span className="font-[family-name:var(--font-inter)] text-xs">
            30-day money-back guarantee
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <IconMail size={14} />
          <span className="font-[family-name:var(--font-inter)] text-xs">
            Need help? Contact us at support@gemsutopia.ca
          </span>
        </div>
      </div>

      <Link
        href="/shop"
        className="mt-4 block text-center font-[family-name:var(--font-inter)] text-sm text-white/60 transition-colors hover:text-white"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
