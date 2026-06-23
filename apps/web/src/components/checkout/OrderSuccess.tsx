'use client';
import { IconPackage, IconArrowRight } from '@tabler/icons-react';
import React, { useEffect } from 'react';
import { AnimatedCheckmark } from '@/components/success-states';

interface OrderSuccessProps {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  amount: number;
  cryptoAmount?: number;
  currency?: string;
  cryptoCurrency?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal?: number;
  shipping?: number;
  paymentMethod?: string;
  shippingMethod?: 'flat' | 'combined';
  appliedDiscount?: {
    code: string;
    type: 'percentage' | 'fixed_amount' | 'fixed';
    value: number;
    amount: number;
    free_shipping: boolean;
    isReferral?: boolean;
    referrerName?: string;
    description?: string;
  };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
}

export default function OrderSuccess({
  orderId,
  customerEmail,
  customerName,
  amount,
  cryptoAmount,
  currency = 'CAD',
  cryptoCurrency,
  items = [],
  subtotal,
  shipping = 0,
  paymentMethod,
  shippingMethod,
  appliedDiscount,
  shippingAddress,
}: OrderSuccessProps) {
  // RECALCULATE values exactly like CheckoutFlow to ensure accuracy
  const calculatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedDiscount = appliedDiscount?.amount || 0;

  // Use calculated values if they're valid, otherwise use passed values
  const actualSubtotal = calculatedSubtotal > 0 ? calculatedSubtotal : subtotal || 0;
  const actualDiscount = calculatedDiscount;

  // USE THE PRESERVED SHIPPING VALUE FROM CHECKOUT - DO NOT RECALCULATE
  const finalShipping = appliedDiscount?.free_shipping ? 0 : shipping || 0;

  const actualShipping = finalShipping;

  useEffect(() => {
    // Simple CSS-based confetti animation instead of external script
    const createConfetti = () => {
      const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s linear forwards`;

        document.body.appendChild(confetti);

        setTimeout(() => {
          if (document.body.contains(confetti)) {
            document.body.removeChild(confetti);
          }
        }, 4000);
      }
    };

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Trigger confetti
    createConfetti();
    setTimeout(createConfetti, 200);
    setTimeout(createConfetti, 400);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="relative z-10">
        <div className="mx-auto mb-6">
          <AnimatedCheckmark size={100} />
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="mb-8 text-lg text-gray-600">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="mb-8 rounded-lg bg-gray-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-mono text-sm">{orderId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-sm">{customerEmail}</span>
            </div>

            {/* Payment Method */}
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="text-sm">
                {cryptoCurrency
                  ? `Crypto (${cryptoCurrency})`
                  : paymentMethod === 'stripe'
                    ? 'Credit/Debit Card'
                    : paymentMethod === 'paypal'
                      ? 'PayPal'
                      : 'Card Payment'}
              </span>
            </div>

            {/* Order Breakdown */}
            <>
              <div className="mt-4 border-t border-gray-200 pt-3">
                <div className="mb-2 text-sm font-medium text-gray-700">Order Breakdown:</div>

                {/* Items with Images - ALWAYS show this section */}
                {items && items.length > 0 ? (
                  <div className="mb-4 space-y-3">
                    <div className="mb-4 text-sm font-medium text-gray-700">Products Ordered:</div>
                    <div className="mb-6 space-y-4">
                      {items.map((item, index) => {
                        const itemTotal = item.price * item.quantity;
                        const itemCryptoTotal =
                          cryptoCurrency && cryptoAmount
                            ? itemTotal * (cryptoAmount / actualSubtotal)
                            : itemTotal;

                        return (
                          <div
                            key={`order-success-${item.id || `item-${index}`}`}
                            className="flex items-center space-x-3"
                          >
                            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {cryptoCurrency
                                ? `${itemCryptoTotal.toFixed(8)} ${cryptoCurrency}`
                                : `$${itemTotal.toFixed(2)} ${currency}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-gray-500">No items found in order</div>
                )}

                {/* Financial breakdown */}
                <div className="space-y-2 border-t border-gray-200 pt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>
                      {cryptoCurrency
                        ? `${((actualSubtotal * (cryptoAmount || 1)) / amount).toFixed(8)} ${cryptoCurrency}`
                        : `$${actualSubtotal.toFixed(2)} ${currency}`}
                    </span>
                  </div>

                  {/* Discount */}
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedDiscount.code}):</span>
                      <span>
                        -
                        {cryptoCurrency
                          ? `${((appliedDiscount.amount * (cryptoAmount || 1)) / amount).toFixed(8)} ${cryptoCurrency}`
                          : `$${appliedDiscount.amount.toFixed(2)} ${currency}`}
                      </span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Shipping{' '}
                      {shippingMethod &&
                        `(${shippingMethod === 'flat' ? 'Flat Rate' : 'Combined'})`}
                      :
                    </span>
                    <span>
                      {appliedDiscount?.free_shipping ? (
                        <span className="text-green-600">FREE</span>
                      ) : cryptoCurrency ? (
                        `${((actualShipping * (cryptoAmount || 1)) / amount).toFixed(8)} ${cryptoCurrency}`
                      ) : (
                        `$${actualShipping.toFixed(2)} ${currency}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>

            {/* Total amount with proper formatting */}
            <div className="mt-3 flex justify-between border-t border-gray-300 pt-3">
              <span className="font-semibold text-gray-900">Total Paid:</span>
              <span className="text-lg font-bold">
                {cryptoCurrency && cryptoAmount ? (
                  <div className="text-right">
                    <div>
                      {cryptoAmount.toFixed(6)} {cryptoCurrency}
                    </div>
                    <div className="text-sm font-normal text-gray-500">
                      (${amount.toFixed(2)} {currency})
                    </div>
                  </div>
                ) : (
                  `$${amount.toFixed(2)} ${currency}`
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium text-green-600">✓ Paid</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="mb-3 flex items-center">
              <IconPackage size={24} className="mr-3 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium">
                {shippingAddress.firstName} {shippingAddress.lastName}
              </p>
              <p>{shippingAddress.address}</p>
              {shippingAddress.apartment && <p>Apt/Suite: {shippingAddress.apartment}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="mb-3 flex items-center">
              <IconPackage size={24} className="mr-3 text-green-600" />
              <h3 className="font-semibold text-green-900">Email Confirmation</h3>
            </div>
            <p className="text-sm text-green-800">
              An order confirmation and receipt has been sent to {customerEmail}
            </p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <div className="mb-3 flex items-center">
              <IconPackage size={24} className="mr-3 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Shipping Update</h3>
            </div>
            <p className="text-sm text-purple-800">
              You'll receive tracking information once your order ships (typically 1-2 business
              days)
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
          >
            Continue Shopping
            <IconArrowRight size={16} className="ml-2" />
          </a>

          <a
            href="/support"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:gemsutopia@gmail.com" className="text-black hover:underline">
              gemsutopia@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
