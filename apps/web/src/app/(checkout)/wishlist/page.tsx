'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IconTrash } from '@tabler/icons-react';
import { EmptyWishlist } from '@/components/empty-states';
import { useWishlist } from '@/contexts/WishlistContext';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { useInventoryUpdates } from '@/lib/pusher-client';

export default function Wishlist() {
  const { items, removeItem, addItem: addToWishlist, clearWishlist } = useWishlist();
  const { items: pouchItems, addItem: addToGemPouch, removeItem: removeFromPouch, updateQuantity, isInPouch } = useGemPouch();
  const { formatPrice } = useCurrency();

  // Real-time inventory updates via WebSocket
  const handleSoldOut = useCallback((data: { productId: string; productName: string }) => {
    toast.info(`${data.productName} just sold out`);
  }, []);

  useInventoryUpdates(undefined, handleSoldOut);

  // Get quantity of item in pouch
  const getItemQuantity = (itemId: string) => {
    const item = pouchItems.find(i => i.id === itemId);
    return item?.quantity || 0;
  };

  // Item is available to add if not explicitly sold out
  const isItemAvailable = (item: any) => {
    // Only consider sold out if inventory is explicitly 0
    if (item.inventory === 0 || item.stock === 0) return false;
    return true;
  };

  const handleDecrementPouch = (item: any) => {
    const pouchItem = pouchItems.find(i => i.id === item.id);
    if (pouchItem) {
      const previousQuantity = pouchItem.quantity;
      const newQuantity = previousQuantity - 1;
      if (newQuantity <= 0) {
        removeFromPouch(item.id);
        toast.success('Removed from Gem Pouch', {
          description: item.name,
          action: {
            label: 'Undo',
            onClick: () => addToGemPouch({ ...pouchItem, quantity: undefined } as any, 1),
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
    }
  };

  const handleAddToPouch = (item: any) => {
    if (item.inventory === 0 || item.stock === 0) {
      toast.error('Item is sold out', {
        description: item.name,
      });
      return;
    }
    const wishlistItem = { ...item };
    const existingPouchItem = pouchItems.find(i => i.id === item.id);
    const previousPouchQuantity = existingPouchItem?.quantity || 0;

    addToGemPouch({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: item.inventory || item.stock,
    });
    removeItem(item.id);
    toast.success('Moved to Gem Pouch', {
      description: item.name,
      action: {
        label: 'Undo',
        onClick: () => {
          addToWishlist(wishlistItem);
          if (previousPouchQuantity === 0) {
            removeFromPouch(item.id);
          } else {
            updateQuantity(item.id, previousPouchQuantity);
          }
        },
      },
    });
  };

  const handleRemove = (item: any) => {
    const removedItem = { ...item };
    removeItem(item.id);
    toast.success('Removed from Wishlist', {
      description: item.name,
      action: {
        label: 'Undo',
        onClick: () => addToWishlist(removedItem),
      },
    });
  };

  const handleAddAllToPouch = () => {
    const availableItems = items.filter(isItemAvailable);
    if (availableItems.length === 0) {
      toast.info('No available items to add');
      return;
    }
    // Capture state before changes
    const wishlistItemsToRestore = [...availableItems];
    const pouchStateBeforeAdd = availableItems.map(item => ({
      id: item.id,
      previousQuantity: pouchItems.find(i => i.id === item.id)?.quantity || 0,
    }));

    availableItems.forEach(item => {
      addToGemPouch({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        stock: item.inventory || item.stock,
      });
      removeItem(item.id);
    });

    toast.success(`Moved ${availableItems.length} items to Gem Pouch`, {
      action: {
        label: 'Undo',
        onClick: () => {
          wishlistItemsToRestore.forEach(item => addToWishlist(item));
          pouchStateBeforeAdd.forEach(({ id, previousQuantity }) => {
            if (previousQuantity === 0) {
              removeFromPouch(id);
            } else {
              updateQuantity(id, previousQuantity);
            }
          });
        },
      },
    });
  };

  const handleClearWishlist = () => {
    const itemsToRestore = [...items];
    clearWishlist();
    toast.success('Wishlist cleared', {
      description: `${itemsToRestore.length} ${itemsToRestore.length === 1 ? 'item' : 'items'} removed`,
      action: {
        label: 'Undo',
        onClick: () => itemsToRestore.forEach(item => addToWishlist(item)),
      },
    });
  };

  const availableCount = items.filter(isItemAvailable).length;

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col bg-black">
        <Header />
        <main className="flex min-h-screen flex-grow items-center justify-center">
          <EmptyWishlist />
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
              Wishlist
            </h1>
            <p className="font-[family-name:var(--font-inter)] text-sm text-white/60 xs:text-base">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
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
                      {/* Remove from Wishlist Button - Top Right */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(item);
                        }}
                        className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white xs:h-8 xs:w-8"
                      >
                        <IconTrash size={14} className="xs:h-4 xs:w-4" />
                      </button>
                      {/* In Pouch Badge - Bottom Right */}
                      {isInPouch(item.id) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDecrementPouch(item);
                          }}
                          className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-md bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-white transition-colors hover:bg-neutral-700 xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs"
                        >
                          <span>{getItemQuantity(item.id)}</span>
                          <IconTrash size={12} className="xs:h-3.5 xs:w-3.5" />
                        </button>
                      )}
                      {/* Sold Out Overlay */}
                      {(item.inventory === 0 || item.stock === 0) && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <span className="font-[family-name:var(--font-bacasime)] text-2xl tracking-wider text-white xs:text-3xl md:text-4xl">
                            SOLD
                          </span>
                        </div>
                      )}
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
                          {formatPrice(item.price)}
                        </span>
                        {isItemAvailable(item) && (
                          <button
                            onClick={() => handleAddToPouch(item)}
                            className="group/bag flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 transition-all hover:bg-white xs:h-8 xs:w-8"
                            aria-label={`Add ${item.name} to pouch`}
                          >
                            <Image
                              src="/icons/bag.svg"
                              alt=""
                              width={14}
                              height={14}
                              className="transition-all group-hover/bag:invert xs:h-4 xs:w-4"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Only: Bottom Buttons */}
              <div className="mt-8 flex flex-col gap-4 xs:mt-10 md:flex-row md:justify-center lg:hidden">
                <button
                  onClick={handleAddAllToPouch}
                  disabled={availableCount === 0}
                  className={`h-10 w-full rounded-md px-8 font-[family-name:var(--font-inter)] text-base transition-all duration-200 sm:h-11 sm:rounded-lg sm:px-10 sm:text-lg md:w-auto ${
                    availableCount === 0
                      ? 'cursor-not-allowed bg-white/20 text-white/50'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  Add All to Pouch{availableCount > 0 ? ` (${availableCount})` : ''}
                </button>
                <button
                  onClick={handleClearWishlist}
                  className="h-10 w-full rounded-md bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:h-11 sm:rounded-lg sm:px-10 sm:text-lg md:w-auto"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>

            {/* Desktop Only: Sticky Sidebar */}
            <div className="hidden w-80 shrink-0 lg:block xl:w-96">
              <div className="sticky top-36">
                {/* Wishlist Summary Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm">
                      <span className="text-white/60">Total Items</span>
                      <span className="text-white">{items.length}</span>
                    </div>
                    <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm">
                      <span className="text-white/60">Available</span>
                      <span className="text-white">{availableCount}</span>
                    </div>
                    {items.length - availableCount > 0 && (
                      <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm">
                        <span className="text-white/60">Sold Out</span>
                        <span className="text-white/40">{items.length - availableCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                    <span className="font-[family-name:var(--font-inter)] text-base font-semibold text-white">
                      Total Value
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-lg font-bold text-white">
                      {formatPrice(items.reduce((sum, item) => sum + item.price, 0))}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      onClick={handleAddAllToPouch}
                      disabled={availableCount === 0}
                      className={`h-11 w-full rounded-xl font-[family-name:var(--font-inter)] text-base transition-all duration-200 ${
                        availableCount === 0
                          ? 'cursor-not-allowed bg-white/20 text-white/50'
                          : 'bg-white text-black hover:bg-white/90'
                      }`}
                    >
                      Add All to Pouch{availableCount > 0 ? ` (${availableCount})` : ''}
                    </button>
                    <button
                      onClick={handleClearWishlist}
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/10"
                    >
                      Clear Wishlist
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
              <span className="text-white/60">Wishlist</span>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
