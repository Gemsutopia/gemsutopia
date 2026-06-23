'use client';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

interface CartReviewProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock?: number;
  }>;
  onContinue: () => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  appliedDiscount: {
    code: string;
    type: 'percentage' | 'fixed_amount' | 'fixed';
    value: number;
    amount: number;
    free_shipping: boolean;
    isReferral?: boolean;
    referrerName?: string;
    description?: string;
  } | null;
  discountError: string;
  validateDiscountCode: () => void;
  removeDiscount: () => void;
}

export default function CartReview({
  items,
  onContinue,
  discountCode,
  setDiscountCode,
  appliedDiscount,
  discountError,
  validateDiscountCode,
  removeDiscount,
}: CartReviewProps) {
  const { removeItem, updateQuantity, addItem } = useGemPouch();
  const { formatPrice } = useCurrency();

  const handleQuantityDecrease = (itemId: string, currentQuantity: number, itemName: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const previousQuantity = currentQuantity;
    const newQuantity = previousQuantity - 1;

    if (newQuantity <= 0) {
      const removedItem = { ...item };
      removeItem(itemId);
      toast.success('Removed from order', {
        description: itemName,
        action: {
          label: 'Undo',
          onClick: () => {
            addItem(removedItem);
          },
        },
      });
    } else {
      updateQuantity(itemId, newQuantity);
      toast.success('Removed 1 from order', {
        description: `${itemName} — ${newQuantity} remaining`,
        action: {
          label: 'Undo',
          onClick: () => updateQuantity(itemId, previousQuantity),
        },
      });
    }
  };

  const handleQuantityIncrease = (itemId: string, currentQuantity: number, itemName: string) => {
    const previousQuantity = currentQuantity;
    const newQuantity = previousQuantity + 1;
    updateQuantity(itemId, newQuantity);
    toast.success('Added 1 to order', {
      description: `${itemName} — ${newQuantity} total`,
      action: {
        label: 'Undo',
        onClick: () => updateQuantity(itemId, previousQuantity),
      },
    });
  };

  const handleDirectRemoval = (itemId: string, itemName: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const removedItem = { ...item };
      removeItem(itemId);
      toast.success('Removed from order', {
        description: itemName,
        action: {
          label: 'Undo',
          onClick: () => {
            addItem(removedItem);
          },
        },
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const discount = appliedDiscount?.amount || 0;
  const subtotalAfterDiscount = subtotal - discount;

  return (
    <div>
      {/* Products Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {items.map(item => (
          <div
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 xs:rounded-2xl"
          >
            {/* Product Image */}
            <Link href={`/product/${item.id}`} className="relative aspect-square overflow-hidden bg-neutral-900">
              {/* Remove Button - Top Right */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDirectRemoval(item.id, item.name);
                }}
                className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white xs:h-8 xs:w-8"
              >
                <IconTrash size={14} className="xs:h-4 xs:w-4" />
              </button>
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </Link>

            {/* Product Info */}
            <div className="p-2.5 xs:p-3">
              {/* Name */}
              <Link href={`/product/${item.id}`} className="block">
                <h2 className="font-[family-name:var(--font-inter)] text-xs font-semibold text-white transition-colors hover:text-white/80 xs:text-sm">
                  <span className="xs:hidden">
                    {item.name.length > 18 ? `${item.name.slice(0, 18)}...` : item.name}
                  </span>
                  <span className="hidden xs:inline">
                    {item.name.length > 24 ? `${item.name.slice(0, 24)}...` : item.name}
                  </span>
                </h2>
              </Link>

              {/* Price Row */}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-[family-name:var(--font-inter)] text-xs font-bold text-white xs:text-sm">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleQuantityDecrease(item.id, item.quantity, item.name)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 xs:h-8 xs:w-8"
                >
                  −
                </button>
                <span className="w-6 text-center font-[family-name:var(--font-inter)] text-xs text-white xs:text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityIncrease(item.id, item.quantity, item.name)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 xs:h-8 xs:w-8"
                  disabled={item.stock !== undefined && item.quantity >= item.stock}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary - Specs Card Style */}
      <div className="mt-8 rounded-lg bg-white/5 xs:mt-10 xs:rounded-xl">
        <div className="flex min-h-9 w-full items-center justify-between px-5 py-2.5 xs:min-h-10 xs:px-6 xs:py-3 sm:min-h-11 sm:px-8">
          <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
            Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-[family-name:var(--font-inter)] text-xs text-white xs:text-sm">
            {formatPrice(subtotal)}
          </span>
        </div>
        {appliedDiscount && (
          <div className="flex min-h-9 w-full items-center justify-between px-5 py-2.5 xs:min-h-10 xs:px-6 xs:py-3 sm:min-h-11 sm:px-8">
            <span className="font-[family-name:var(--font-inter)] text-xs text-green-400 xs:text-sm">
              Discount ({appliedDiscount.code})
            </span>
            <span className="font-[family-name:var(--font-inter)] text-xs text-green-400 xs:text-sm">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
        <div className="flex min-h-9 w-full items-center justify-between px-5 py-2.5 xs:min-h-10 xs:px-6 xs:py-3 sm:min-h-11 sm:px-8">
          <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
            Shipping
          </span>
          <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
            Calculated next
          </span>
        </div>
        <div className="flex min-h-11 w-full items-center justify-between px-5 py-3 xs:min-h-12 xs:px-6 xs:py-4 sm:px-8">
          <span className="font-[family-name:var(--font-inter)] text-sm font-semibold text-white xs:text-base">
            Total
          </span>
          <span className="font-[family-name:var(--font-inter)] text-sm font-semibold text-white xs:text-base">
            {formatPrice(subtotalAfterDiscount)}
          </span>
        </div>
        <div className="px-5 pb-3 xs:px-6 xs:pb-4 sm:px-8">
          <p className="font-[family-name:var(--font-inter)] text-xs text-white/40">
            Taxes included in price
          </p>
        </div>
      </div>

      {/* Discount Code - Newsletter Style */}
      <div className="mt-6 xs:mt-8">
        <p className="mb-3 font-[family-name:var(--font-inter)] text-sm text-white/60">
          Have a discount or referral code?
        </p>
        {appliedDiscount ? (
          <div className={`flex items-center justify-between rounded-lg p-3 ${
            appliedDiscount.isReferral
              ? 'bg-purple-500/10'
              : 'bg-green-500/10'
          }`}>
            <div className="flex items-center gap-2">
              <IconCheck size={18} className={appliedDiscount.isReferral ? 'text-purple-400' : 'text-green-400'} />
              <div>
                <p className={`text-sm font-medium ${appliedDiscount.isReferral ? 'text-purple-300' : 'text-green-300'}`}>
                  {appliedDiscount.isReferral ? (
                    <>Referral from {appliedDiscount.referrerName || 'a friend'}</>
                  ) : (
                    <>"{appliedDiscount.code}" applied</>
                  )}
                </p>
                <p className={`text-xs ${appliedDiscount.isReferral ? 'text-purple-400/70' : 'text-green-400/70'}`}>
                  {appliedDiscount.description || (
                    <>
                      {appliedDiscount.type === 'percentage'
                        ? `${appliedDiscount.value}% off`
                        : `${formatPrice(appliedDiscount.value)} off`}
                      {appliedDiscount.free_shipping && ' + Free shipping'}
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={removeDiscount}
              className={`p-1.5 transition-colors ${
                appliedDiscount.isReferral
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-green-400 hover:text-green-300'
              }`}
            >
              <IconX size={16} />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex">
              <input
                type="text"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                placeholder="Enter code"
                className="h-10 flex-1 rounded-l-lg border border-r-0 border-white/10 bg-white/5 px-4 font-[family-name:var(--font-inter)] text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none xs:h-11"
                onKeyDown={e => e.key === 'Enter' && validateDiscountCode()}
              />
              <button
                onClick={validateDiscountCode}
                disabled={!discountCode.trim()}
                className="h-10 rounded-r-lg border border-white/10 bg-white/10 px-5 font-[family-name:var(--font-inter)] text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50 xs:h-11 xs:px-6"
              >
                Apply
              </button>
            </div>
            {discountError && <p className="mt-2 text-sm text-red-400">{discountError}</p>}
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <button
        onClick={onContinue}
        disabled={items.length === 0}
        className="mt-6 h-10 w-full rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50 xs:mt-8 xs:h-11 xs:text-base"
      >
        Proceed to Shipping
      </button>

      {/* Continue Shopping Link */}
      <Link
        href="/shop"
        className="mt-4 block text-center font-[family-name:var(--font-inter)] text-sm text-white/60 transition-colors hover:text-white"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
