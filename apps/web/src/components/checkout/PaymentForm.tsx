'use client';

import { IconBrandPaypal, IconLock } from '@tabler/icons-react';
import { useState } from 'react';
import { store } from '@/lib/store';

interface PaymentFormProps {
  paymentMethod: 'paypal';
  amount: number;
  currency: string;
  customerData: any;
  items: any[];
  validationItems: any[];
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
  onSuccess: (data: { orderId: string; actualAmount?: number; currency?: string }) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({
  amount,
  currency,
  customerData,
  validationItems,
  appliedDiscount,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const currentProducts = await Promise.all(
        validationItems.map((item) => store.products.get(item.id))
      );

      for (let index = 0; index < validationItems.length; index += 1) {
        const cartItem = validationItems[index];
        const product = currentProducts[index].product;
        const variant = cartItem.variantId
          ? product.variants?.find((candidate) => candidate.id === cartItem.variantId)
          : product.variants?.[0];
        const currentPrice = Number(variant?.price || product.price);
        const availableStock = product.stock?.length
          ? cartItem.variantId
            ? Math.max(
                0,
                product.stock.find((stock) => stock.variantId === cartItem.variantId)?.quantity ?? 0
              )
            : product.stock.reduce((total, stock) => total + Math.max(0, stock.quantity), 0)
          : 0;

        if (availableStock < cartItem.quantity) {
          throw new Error(`${product.name} no longer has enough stock for this order.`);
        }
        if (
          !Number.isFinite(currentPrice) ||
          Math.abs(currentPrice - Number(cartItem.price)) > 0.009
        ) {
          throw new Error(`${product.name} has changed price. Return to your cart to review it.`);
        }
      }

      const origin = window.location.origin;
      const checkoutAttemptId = crypto.randomUUID();
      const data = await store.payments.createPayPalOrder({
        items: validationItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        successUrl: `${origin}/checkout?payment_method=paypal&status=success`,
        cancelUrl: `${origin}/checkout?payment_method=paypal&status=cancelled`,
        country: customerData.country === 'United States' ? 'US' : 'CA',
        state: customerData.state,
        discountCode: appliedDiscount?.code,
        customerEmail: customerData.email,
        checkoutAttemptId,
      });

      const authoritativeItems = data.quote.items.map((quotedItem) => {
        const cartItem = validationItems.find((item) => item.variantId === quotedItem.variantId);
        return {
          ...cartItem,
          id: quotedItem.productId,
          variantId: quotedItem.variantId,
          name: quotedItem.name,
          price: quotedItem.unitAmount,
          quantity: quotedItem.quantity,
        };
      });

      sessionStorage.setItem(
        'paypalCheckoutData',
        JSON.stringify({
          orderId: data.orderId,
          checkoutAttemptId,
          customerData,
          items: authoritativeItems,
          subtotal: data.quote.subtotal,
          shipping: data.quote.shippingAmount,
          appliedDiscount: appliedDiscount
            ? { ...appliedDiscount, amount: data.quote.discountAmount }
            : null,
          amount: data.quote.total,
          currency: data.quote.currency,
        })
      );

      window.location.href = data.approveUrl;
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Unable to start PayPal checkout. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconBrandPaypal size={26} className="text-white" />
        <h2 className="text-lg font-semibold text-white">Pay with PayPal</h2>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconLock size={18} className="mt-0.5 shrink-0 text-white/60" />
          <p className="text-sm leading-6 text-white/60">
            You&apos;ll be redirected to PayPal to securely complete your payment, then returned
            here for confirmation.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-white/60">Total amount</span>
        <span className="text-lg font-semibold text-white">
          ${amount.toFixed(2)} {currency}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            Redirecting to PayPal...
          </span>
        ) : (
          'Continue to PayPal'
        )}
      </button>
    </div>
  );
}
