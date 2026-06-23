'use client';

import Link from 'next/link';
import { IconX, IconArrowLeft, IconShoppingCart } from '@tabler/icons-react';

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        {/* Cancel Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
          <IconX size={32} className="text-amber-400" />
        </div>

        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-2xl text-white md:text-3xl">
          Payment Cancelled
        </h1>
        <p className="mb-8 text-sm text-white/60">
          Your payment was cancelled. No charges were made. Your items are still in your Gem Pouch.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            <IconArrowLeft size={16} />
            Return to Checkout
          </Link>
          <Link
            href="/gem-pouch"
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 font-[family-name:var(--font-inter)] text-sm text-white transition-colors hover:border-white/40"
          >
            <IconShoppingCart size={16} />
            View Gem Pouch
          </Link>
          <Link
            href="/shop"
            className="mt-2 text-sm text-white/50 underline underline-offset-2 hover:text-white/70"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
