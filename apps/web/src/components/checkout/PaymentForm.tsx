'use client';
import { useState, useEffect } from 'react';
import { IconLock, IconCreditCard, IconWallet, IconCurrencyBitcoin, IconBuildingStore, IconSquare, IconLoader2 } from '@tabler/icons-react';
import { store } from '@/lib/store';

type PaymentMethodType = 'stripe' | 'paypal' | 'polar' | 'reown' | 'shopify' | 'square';

interface PaymentFormProps {
  paymentMethod: PaymentMethodType;
  amount: number;
  customerData: any;
  items: any[];
  appliedDiscount?: {
    code: string;
    type: 'percentage' | 'fixed_amount' | 'fixed';
    value: number;
    amount: number;
    free_shipping: boolean;
    isReferral?: boolean;
    referralId?: string;
    referrerName?: string;
    description?: string;
    discountCodeId?: string;
  } | null;
  subtotal: number;
  shipping: number;
  onSuccess: (data: {
    orderId: string;
    actualAmount?: number;
    cryptoAmount?: number;
    currency?: string;
    cryptoCurrency?: string;
    cryptoNetwork?: string;
  }) => void;
  onError: (error: string) => void;
}

function storeCheckoutData(key: string, data: any) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

function getCheckoutOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

function getCurrency() {
  return typeof window !== 'undefined' ? localStorage.getItem('currency') || 'CAD' : 'CAD';
}

function AmountDisplay({ amount }: { amount: number }) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-inter)] text-sm text-white/60">Total Amount</span>
        <span className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">
          ${amount.toFixed(2)} {getCurrency()}
        </span>
      </div>
      <p className="mt-1 font-[family-name:var(--font-inter)] text-xs text-white/40">Taxes included in price</p>
    </div>
  );
}

function CheckoutButton({ loading, loadingText, label, onClick, disabled }: {
  loading: boolean;
  loadingText: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="h-11 w-full rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          {loadingText}
        </span>
      ) : label}
    </button>
  );
}

function StripeForm({ amount, customerData, items, appliedDiscount, subtotal, shipping, onError }: Omit<PaymentFormProps, 'paymentMethod' | 'onSuccess'>) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const currency = getCurrency();
      const origin = getCheckoutOrigin();

      const data = await store.payments.createStripeSession({
        items: items.map(item => ({
          name: item.name || 'Item',
          price: item.price,
          quantity: item.quantity || 1,
        })),
        customerEmail: customerData.email,
        successUrl: `${origin}/checkout?payment_method=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout?payment_method=stripe&status=cancelled`,
        shippingAmount: shipping,
        discountAmount: appliedDiscount?.amount,
        discountCode: appliedDiscount?.code,
        metadata: {
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          currency,
        },
      });

      storeCheckoutData('stripeCheckoutData', {
        customerData, items, subtotal, shipping, appliedDiscount, amount, currency,
      });

      window.location.href = data.url;
    } catch {
      onError('Failed to initialize Stripe checkout');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconCreditCard size={24} className="text-white" />
        <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">Card Payment</h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconLock size={18} className="mt-0.5 flex-shrink-0 text-white/60" />
          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
            You&apos;ll be redirected to Stripe&apos;s secure checkout page to complete your payment.
          </p>
        </div>
      </div>
      <AmountDisplay amount={amount} />
      <CheckoutButton loading={loading} loadingText="Redirecting to Stripe..." label="Continue to Stripe Checkout" onClick={handleCheckout} />
    </div>
  );
}

function PayPalForm({ amount, customerData, items, appliedDiscount, subtotal, shipping, onError }: Omit<PaymentFormProps, 'paymentMethod' | 'onSuccess'>) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const currency = getCurrency();
      const origin = getCheckoutOrigin();

      const data = await store.payments.createPayPalOrder({
        items: items.map(item => ({
          name: item.name || 'Item',
          quantity: item.quantity || 1,
          amount: item.price,
        })),
        currency: currency.toUpperCase(),
        successUrl: `${origin}/checkout?payment_method=paypal&status=success`,
        cancelUrl: `${origin}/checkout?payment_method=paypal&status=cancelled`,
        metadata: {
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          customerEmail: customerData.email,
        },
      });

      storeCheckoutData('paypalCheckoutData', {
        orderId: data.orderId, customerData, items, subtotal, shipping, appliedDiscount, amount, currency,
      });

      window.location.href = data.approveUrl;
    } catch {
      onError('Failed to initialize PayPal checkout');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconWallet size={24} className="text-white" />
        <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">PayPal Payment</h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconWallet size={18} className="mt-0.5 flex-shrink-0 text-white/60" />
          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
            You&apos;ll be redirected to PayPal to complete your payment. You can use your PayPal balance, Venmo, or a card.
          </p>
        </div>
      </div>
      <AmountDisplay amount={amount} />
      <CheckoutButton loading={loading} loadingText="Redirecting to PayPal..." label="Continue to PayPal" onClick={handleCheckout} />
    </div>
  );
}

function PolarForm({ amount, customerData, items, appliedDiscount, subtotal, shipping, onError }: Omit<PaymentFormProps, 'paymentMethod' | 'onSuccess'>) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const currency = getCurrency();
      const origin = getCheckoutOrigin();

      const data = await store.payments.createPolarCheckout({
        amount,
        currency: currency.toLowerCase(),
        successUrl: `${origin}/checkout?payment_method=polar&status=success`,
        metadata: {
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          customerEmail: customerData.email,
        },
      });

      storeCheckoutData('polarCheckoutData', {
        checkoutId: data.checkoutId, customerData, items, subtotal, shipping, appliedDiscount, amount, currency,
      });

      window.location.href = data.url;
    } catch {
      onError('Failed to initialize Polar checkout');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconWallet size={24} className="text-white" />
        <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">Polar Payment</h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconLock size={18} className="mt-0.5 flex-shrink-0 text-white/60" />
          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
            You&apos;ll be redirected to Polar&apos;s secure checkout page to complete your payment.
          </p>
        </div>
      </div>
      <AmountDisplay amount={amount} />
      <CheckoutButton loading={loading} loadingText="Redirecting to Polar..." label="Continue to Polar Checkout" onClick={handleCheckout} />
    </div>
  );
}

function ReownForm({ amount, customerData, items, appliedDiscount, subtotal, shipping, onSuccess, onError }: Omit<PaymentFormProps, 'paymentMethod'>) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{ projectId: string; chains: string[] } | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await store.payments.getReownConfig();
        setConfig(data);
      } catch {
        // Config not available
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const chainNames: Record<string, string> = {
    btc: 'Bitcoin', eth: 'Ethereum', sol: 'Solana', usdc: 'USDC',
    usdt: 'USDT', bnb: 'BNB', zec: 'Zcash', xrp: 'XRP',
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 size={24} className="animate-spin text-white/60" />
        <span className="ml-2 font-[family-name:var(--font-inter)] text-sm text-white/60">Loading crypto payment...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
          Crypto payments are not available at this time.
        </p>
      </div>
    );
  }

  const handleConnect = async () => {
    setLoading(true);
    try {
      // TODO: Full @reown/appkit wallet connection integration
      // For now, crypto wallet payments are in development
      onError('Crypto wallet payments are coming soon. Please select another payment method.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconCurrencyBitcoin size={24} className="text-white" />
        <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">Crypto Payment</h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconLock size={18} className="mt-0.5 flex-shrink-0 text-white/60" />
          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
            Connect your wallet to pay with cryptocurrency.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {config.chains.map(chain => (
            <span key={chain} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-[family-name:var(--font-inter)] text-xs text-white/70">
              {chainNames[chain.toLowerCase()] || chain.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <AmountDisplay amount={amount} />
      <CheckoutButton loading={loading} loadingText="Connecting wallet..." label="Connect Wallet & Pay" onClick={handleConnect} />
    </div>
  );
}

function ShopifyForm({ amount, customerData, items, appliedDiscount, subtotal, shipping, onError }: Omit<PaymentFormProps, 'paymentMethod' | 'onSuccess'>) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const currency = getCurrency();

      const data = await store.payments.createShopifyCheckout({
        items: items.map(item => ({
          variantId: item.shopifyVariantId || item.id,
          quantity: item.quantity || 1,
        })),
        email: customerData.email,
      });

      storeCheckoutData('shopifyCheckoutData', {
        checkoutId: data.checkoutId, customerData, items, subtotal, shipping, appliedDiscount, amount, currency,
      });

      window.location.href = data.webUrl;
    } catch {
      onError('Failed to initialize Shopify checkout');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconBuildingStore size={24} className="text-white" />
        <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">Shopify Checkout</h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconLock size={18} className="mt-0.5 flex-shrink-0 text-white/60" />
          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
            You&apos;ll be redirected to Shopify&apos;s secure checkout to complete your purchase.
          </p>
        </div>
      </div>
      <AmountDisplay amount={amount} />
      <CheckoutButton loading={loading} loadingText="Redirecting to Shopify..." label="Continue to Shopify Checkout" onClick={handleCheckout} />
    </div>
  );
}

function SquareForm({ amount, customerData, items, appliedDiscount, subtotal, shipping, onError }: Omit<PaymentFormProps, 'paymentMethod' | 'onSuccess'>) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const currency = getCurrency();
      const origin = getCheckoutOrigin();

      const data = await store.payments.createSquareCheckout({
        items: items.map(item => ({
          name: item.name || 'Item',
          quantity: item.quantity || 1,
          amount: item.price,
        })),
        currency: currency.toUpperCase(),
        successUrl: `${origin}/checkout?payment_method=square&status=success`,
        metadata: {
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          customerEmail: customerData.email,
        },
      });

      storeCheckoutData('squareCheckoutData', {
        orderId: data.orderId, paymentLinkId: data.paymentLinkId, customerData, items, subtotal, shipping, appliedDiscount, amount, currency,
      });

      window.location.href = data.url;
    } catch {
      onError('Failed to initialize Square checkout');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconSquare size={24} className="text-white" />
        <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">Square Checkout</h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconLock size={18} className="mt-0.5 flex-shrink-0 text-white/60" />
          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60">
            You&apos;ll be redirected to Square&apos;s secure checkout to complete your payment.
          </p>
        </div>
      </div>
      <AmountDisplay amount={amount} />
      <CheckoutButton loading={loading} loadingText="Redirecting to Square..." label="Continue to Square Checkout" onClick={handleCheckout} />
    </div>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  switch (props.paymentMethod) {
    case 'stripe': return <StripeForm {...props} />;
    case 'paypal': return <PayPalForm {...props} />;
    case 'polar': return <PolarForm {...props} />;
    case 'reown': return <ReownForm {...props} />;
    case 'shopify': return <ShopifyForm {...props} />;
    case 'square': return <SquareForm {...props} />;
    default: return null;
  }
}
