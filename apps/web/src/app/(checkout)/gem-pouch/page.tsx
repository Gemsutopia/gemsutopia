'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { EmptyCart } from '@/components/empty-states';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { IconTrash, IconHeart, IconMinus, IconPlus } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { useInventoryUpdates } from '@/lib/pusher-client';

export default function GemPouch() {
  const { items, removeItem, updateQuantity, clearPouch, addItem: addToPouch } = useGemPouch();
  const { formatPrice } = useCurrency();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Real-time inventory updates via WebSocket
  const handleSoldOut = useCallback((data: { productId: string; productName: string }) => {
    toast.info(`${data.productName} just sold out`);
  }, []);

  useInventoryUpdates(undefined, handleSoldOut);

  const handleRemove = (item: typeof items[0]) => {
    const removedItem = { ...item };
    removeItem(item.id);
    toast.success('Removed from Gem Pouch', {
      description: item.name,
      action: {
        label: 'Undo',
        onClick: () => addToPouch(removedItem),
      },
    });
  };

  const handleDecrement = (item: typeof items[0]) => {
    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity - 1;

    if (newQuantity <= 0) {
      const removedItem = { ...item };
      removeItem(item.id);
      toast.success('Removed from Gem Pouch', {
        description: item.name,
        action: {
          label: 'Undo',
          onClick: () => addToPouch(removedItem),
        },
      });
    } else {
      updateQuantity(item.id, newQuantity);
      toast.success('Removed 1 from Gem Pouch', {
        description: `${item.name} — ${newQuantity} remaining`,
        action: {
          label: 'Undo',
          onClick: () => updateQuantity(item.id, previousQuantity),
        },
      });
    }
  };

  const handleIncrement = (item: typeof items[0]) => {
    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity + 1;
    updateQuantity(item.id, newQuantity);
    toast.success('Added 1 to Gem Pouch', {
      description: `${item.name} — ${newQuantity} total`,
      action: {
        label: 'Undo',
        onClick: () => updateQuantity(item.id, previousQuantity),
      },
    });
  };

  const handleMoveToWishlist = (item: typeof items[0]) => {
    if (!isInWishlist(item.id)) {
      const removedItem = { ...item };
      addToWishlist({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      });
      removeItem(item.id);
      toast.success('Moved to Wishlist', {
        description: item.name,
        action: {
          label: 'Undo',
          onClick: () => {
            addToPouch(removedItem);
          },
        },
      });
    } else {
      toast.info('Already in Wishlist', {
        description: item.name,
      });
    }
  };

  const handleClearCart = () => {
    const itemsToRestore = [...items];
    clearPouch();
    toast.success('Gem Pouch cleared', {
      description: `${itemsToRestore.length} ${itemsToRestore.length === 1 ? 'item' : 'items'} removed`,
      action: {
        label: 'Undo',
        onClick: () => itemsToRestore.forEach(item => addToPouch(item)),
      },
    });
  };

  // Show empty state when no items
  if (items.length === 0) {
    return (
      <div className="flex flex-col bg-black">
        <Header />
        <main className="flex min-h-screen flex-grow items-center justify-center">
          <EmptyCart />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-black">
      <Header />

      <main className="min-h-screen flex-grow px-4 pb-16 pt-28 xs:px-5 xs:pt-32 sm:px-6 md:px-12 md:pt-32 lg:px-24 lg:pb-20 lg:pt-36 xl:px-32 3xl:px-40">
        <div className="mx-auto max-w-7xl 3xl:max-w-[1600px]">
          {/* Page Header */}
          <div className="mb-6 text-center xs:mb-8 md:mb-10 lg:mb-12">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-3xl text-white xs:mb-4 xs:text-4xl md:text-5xl lg:text-6xl">
              Gem Pouch
            </h1>
            <p className="font-[family-name:var(--font-inter)] text-sm text-white/60 xs:text-base">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your pouch
            </p>
          </div>

          {/* Desktop: Side-by-side layout | Mobile: Stacked layout */}
          <div className="lg:flex lg:gap-8">
            {/* Products Grid - 2 columns on all sizes, left side on desktop */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3 xs:gap-4 md:gap-5 lg:gap-6">
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
                          handleRemove(item);
                        }}
                        className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white xs:h-8 xs:w-8"
                      >
                        <IconTrash size={14} className="xs:h-4 xs:w-4" />
                      </button>
                      {/* Wishlist Button - Top Left */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleMoveToWishlist(item);
                        }}
                        className={`absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors xs:h-8 xs:w-8 ${
                          isInWishlist(item.id)
                            ? 'bg-white/20 text-white'
                            : 'bg-black/50 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <IconHeart size={14} className="xs:h-4 xs:w-4" fill={isInWishlist(item.id) ? 'currentColor' : 'none'} />
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
                          onClick={() => handleDecrement(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 xs:h-8 xs:w-8"
                        >
                          <IconMinus size={12} />
                        </button>
                        <span className="w-6 text-center font-[family-name:var(--font-inter)] text-xs text-white xs:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 xs:h-8 xs:w-8"
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                        >
                          <IconPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Only: Order Summary Card */}
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 xs:mt-10 xs:p-6 lg:hidden">
                <div className="space-y-3 border-b border-white/10 pb-4">
                  <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm">
                    <span className="text-white/60">Subtotal ({totalItems} items)</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-white/60">Calculated at checkout</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="font-[family-name:var(--font-inter)] text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="font-[family-name:var(--font-inter)] text-xl font-bold text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Mobile Only: Bottom Buttons */}
              <div className="mt-8 flex flex-col gap-4 xs:mt-10 md:flex-row md:justify-center lg:hidden">
                <Link href="/checkout" className="w-full md:w-auto">
                  <button className="h-10 w-full rounded-md bg-white px-8 font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90 sm:h-11 sm:rounded-lg sm:px-10 sm:text-lg md:w-auto">
                    Checkout
                  </button>
                </Link>
                <button
                  onClick={handleClearCart}
                  className="h-10 w-full rounded-md bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:h-11 sm:rounded-lg sm:px-10 sm:text-lg md:w-auto"
                >
                  Clear Pouch
                </button>
              </div>

              {/* Mobile Only: Continue Shopping Link */}
              <div className="mt-6 flex justify-center lg:hidden">
                <Link
                  href="/shop"
                  className="font-[family-name:var(--font-inter)] text-sm text-white/60 transition-colors hover:text-white"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Desktop Only: Sticky Sidebar */}
            <div className="hidden w-80 shrink-0 lg:block xl:w-96">
              <div className="sticky top-36">
                {/* Order Summary Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm">
                      <span className="text-white/60">Subtotal ({totalItems} items)</span>
                      <span className="text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm">
                      <span className="text-white/60">Shipping</span>
                      <span className="text-white/60">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                    <span className="font-[family-name:var(--font-inter)] text-base font-semibold text-white">
                      Total
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-lg font-bold text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="mt-5 flex flex-col gap-3">
                    <Link href="/checkout" className="w-full">
                      <button className="h-11 w-full rounded-xl bg-white font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90">
                        Checkout
                      </button>
                    </Link>
                    <button
                      onClick={handleClearCart}
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/10"
                    >
                      Clear Pouch
                    </button>
                  </div>

                  {/* Continue Shopping Link */}
                  <div className="mt-4 flex justify-center">
                    <Link
                      href="/shop"
                      className="font-[family-name:var(--font-inter)] text-sm text-white/60 transition-colors hover:text-white"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="mt-10 flex justify-center xs:mt-12 md:mt-16 lg:mt-20">
            <nav className="flex items-center gap-2 font-[family-name:var(--font-inter)] text-xs text-white/40 xs:text-sm">
              <Link href="/" className="transition-colors hover:text-white/60">Home</Link>
              <span>/</span>
              <span className="text-white/60">Gem Pouch</span>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
