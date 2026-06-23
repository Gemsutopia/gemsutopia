'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDevice } from '@/hooks/useDevice';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { IconTrash } from '@tabler/icons-react';
import ReviewModal from '@/components/modals/ReviewModal';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { store } from '@/lib/store';

// Helper to check if URL is a video
const isVideo = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  sale_price?: number;
  onSale?: boolean;
  on_sale?: boolean;
  images: string[];
  inventory: number;
  sku: string;
  // Category
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  // Specs
  gemstoneType?: string;
  gemstone_type?: string;
  caratWeight?: string;
  carat_weight?: string;
  cut?: string;
  clarity?: string;
  color?: string;
  origin?: string;
  certification?: string;
  certificationNumber?: string;
  certification_number?: string;
  treatment?: string;
}

interface ProductContentProps {
  product: Product;
}

const placeholderMedia = [
  '/images/products/gem.png',
  '/images/products/gem2.png',
  '/images/products/gem3.png',
  '/images/products/gem4.png',
  '/images/products/gem5.png',
  '/images/products/gem6.png',
  '/images/products/gem7.png',
  '/images/products/gem8.png',
  '/images/products/gem9.png',
  '/images/products/gem10.png',
  '/images/products/gem11.png',
];

export default function ProductContent({ product }: ProductContentProps) {
  // Use placeholders for testing, remove this later
  const images = placeholderMedia;
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [secondaryHovered, setSecondaryHovered] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { isLg } = useDevice();

  // Fetch similar products from same category via Quickdash
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product.category?.slug) return;
      try {
        const { products: quickdashProducts } = await store.products.list({
          category: product.category.slug,
          limit: 5,
        });
        // Map and filter out current product
        const filtered = quickdashProducts
          .filter((p) => p.id !== product.id)
          .slice(0, 4)
          .map((p) => ({
            id: p.id,
            name: p.name,
            type: p.category?.id || '',
            price: parseFloat(p.price),
            originalPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : parseFloat(p.price),
            image: p.thumbnail || p.images?.[0] || '/images/placeholder.jpg',
            images: p.images || [],
            featuredImageIndex: 0,
            stock: 99,
          }));
        setSimilarProducts(filtered as any);
      } catch {
        // Silently fail
      }
    };
    fetchSimilarProducts();
  }, [product.id, product.category?.slug]);
  const { items: pouchItems, addItem: addToPouch, removeItem: removeFromPouch, updateQuantity, isInPouch } = useGemPouch();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { addViewed, getExcluding } = useRecentlyViewed();

  // Track this product as recently viewed
  useEffect(() => {
    addViewed({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.images?.[0] || placeholderMedia[0],
    });
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const recentlyViewed = getExcluding(product.id);

  // Get quantity of this product in pouch
  const pouchQuantity = pouchItems.find(i => i.id === product.id)?.quantity || 0;

  const handleAddToPouch = () => {
    if (product.inventory === 0) return;

    const item = {
      id: product.id,
      name: product.name,
      price: (product.onSale || product.on_sale) && (product.salePrice || product.sale_price)
        ? Number(product.salePrice || product.sale_price)
        : product.price,
      image: product.images?.[0] || images[0],
      stock: product.inventory,
    };

    const existingItem = pouchItems.find(i => i.id === product.id);
    const previousQuantity = existingItem?.quantity || 0;
    const addedQuantity = quantity;

    addToPouch(item, quantity);
    toast.success(quantity > 1 ? `Added ${quantity} to Gem Pouch` : 'Added to Gem Pouch', {
      description: product.name,
      action: {
        label: 'Undo',
        onClick: () => {
          if (previousQuantity === 0) {
            removeFromPouch(product.id);
          } else {
            updateQuantity(product.id, previousQuantity);
          }
        },
      },
    });

    // Reset quantity after adding
    setQuantity(1);
  };

  const handleAddToWishlist = () => {
    if (isInWishlist(product.id)) {
      toast.info('Already in wishlist');
      return;
    }

    addToWishlist({
      id: product.id,
      name: product.name,
      price: (product.onSale || product.on_sale) && (product.salePrice || product.sale_price)
        ? Number(product.salePrice || product.sale_price)
        : product.price,
      image: product.images?.[0] || images[0],
      inventory: product.inventory,
    });
    toast.success('Added to Wishlist', {
      description: product.name,
    });
  };

  const handleRemoveFromPouch = () => {
    const item = pouchItems.find(i => i.id === product.id);
    if (item) {
      const previousQuantity = item.quantity;
      const newQuantity = previousQuantity - 1;

      if (newQuantity <= 0) {
        // Removing last item
        removeFromPouch(product.id);
        toast.success('Removed from Gem Pouch', {
          description: product.name,
          action: {
            label: 'Undo',
            onClick: () => addToPouch({ ...item, quantity: undefined } as any, 1),
          },
        });
      } else {
        // Decrementing quantity
        updateQuantity(product.id, newQuantity);
        toast.success('Removed 1 from Gem Pouch', {
          description: `${product.name} — ${newQuantity} remaining`,
          action: {
            label: 'Undo',
            onClick: () => updateQuantity(product.id, previousQuantity),
          },
        });
      }
    }
  };

  // Lock body scroll and hide header when zoom modal is open
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('zoom-modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('zoom-modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('zoom-modal-open');
    };
  }, [isZoomed]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedImage < images.length - 1) {
        setSelectedImage(selectedImage + 1);
      } else if (diff < 0 && selectedImage > 0) {
        setSelectedImage(selectedImage - 1);
      }
    }
    setTouchStart(null);
  };

  return (
    <div className="px-4 pb-16 pt-[78px] xs:px-5 xs:pt-[88px] sm:px-6 sm:pt-[96px] md:px-12 md:pt-28 lg:px-24 lg:pb-20 lg:pt-36 xl:px-32 3xl:px-40">
      <div className="mx-auto max-w-7xl 3xl:max-w-[1600px]">
        <div className="flex flex-col gap-4 xs:gap-5 md:gap-6 lg:flex-row lg:items-start lg:gap-6">
          {/* Thumbnails - left on desktop, bottom on mobile/tablet */}
          <div className="scrollbar-none -mx-4 order-2 flex w-screen flex-row gap-2.5 overflow-x-auto overscroll-x-contain px-4 py-1 xs:-mx-5 xs:w-[calc(100%+2.5rem)] xs:gap-3 xs:px-5 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 md:mx-0 md:w-auto md:justify-center md:px-1 lg:order-1 lg:h-[500px] lg:w-auto lg:flex-col lg:justify-start lg:gap-3 lg:overflow-y-auto lg:overscroll-y-contain lg:p-1 xl:h-[550px]">
            {images.map((media, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 transition-all xs:h-16 xs:w-16 md:h-[4.5rem] md:w-[4.5rem] lg:h-16 lg:w-16 ${
                  selectedImage === index
                    ? 'opacity-100'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                {isVideo(media) ? (
                  <>
                    <video
                      src={media}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg className="h-5 w-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <Image
                    src={media}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main image carousel */}
          <div
            className="relative order-1 -mx-4 aspect-square w-screen overflow-hidden xs:-mx-5 xs:w-[calc(100%+2.5rem)] sm:-mx-6 sm:w-[calc(100%+3rem)] md:mx-0 md:w-full md:max-w-xl lg:order-2 lg:h-[500px] lg:w-[500px] lg:max-w-none xl:h-[550px] xl:w-[550px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full w-full transition-transform duration-300 ease-out lg:flex-col lg:gap-4"
              style={{
                transform: isLg
                  ? `translateY(calc(-${selectedImage * 100}% - ${selectedImage * 16}px))`
                  : `translateX(-${selectedImage * 100}%)`,
              }}
            >
              {images.map((media, index) => (
                <div
                  key={index}
                  className="relative aspect-square w-full flex-shrink-0 px-2 xs:px-4 sm:px-6 lg:h-full lg:w-full lg:px-0"
                >
                  <div
                    onClick={() => !isVideo(media) && setIsZoomed(true)}
                    className={`relative h-full w-full overflow-hidden rounded-2xl bg-neutral-900 ${!isVideo(media) ? 'cursor-zoom-in' : ''}`}
                  >
                    {isVideo(media) ? (
                      <video
                        src={media}
                        className="h-full w-full object-cover"
                        controls
                        playsInline
                        muted
                        loop
                      />
                    ) : (
                      <Image
                        src={media}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    )}
                    {/* Sold Out Overlay */}
                    {product.inventory === 0 && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                        <span className="font-[family-name:var(--font-bacasime)] text-4xl tracking-wider text-white xs:text-5xl md:text-6xl">
                          SOLD
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="order-3 flex flex-col md:items-center md:text-center lg:h-[500px] lg:flex-1 lg:items-start lg:justify-between lg:pl-6 lg:text-left xl:h-[550px] xl:pl-10">
            {/* Top content */}
            <div className="w-full">
              <h1 className="font-[family-name:var(--font-bacasime)] text-2xl text-white xs:text-3xl lg:text-4xl xl:text-[2.75rem]">
                {product.name}
              </h1>

              {/* Subtitle */}
              {product.category && (
                <p className="mt-1 font-[family-name:var(--font-inter)] text-sm text-white/50 lg:text-base">
                  {product.category.name}
                </p>
              )}

              {/* Reviews & Badge Row */}
              <div className="mt-2.5 flex items-center gap-3 xs:mt-3 xs:gap-4 md:justify-center lg:justify-start">
                {/* Star Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4"
                        fill="url(#goldGradient)"
                        viewBox="0 0 20 20"
                      >
                        <defs>
                          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fcd34d" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-[family-name:var(--font-inter)] text-sm text-white/50">(24)</span>
                </div>

                {/* Best Seller Badge */}
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-[family-name:var(--font-inter)] text-xs font-medium text-amber-400">
                  #1 Best Seller
                </span>

                {/* Write a Review */}
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="font-[family-name:var(--font-inter)] text-xs text-white/50 underline underline-offset-2 transition-colors hover:text-white/80"
                >
                  Write a Review
                </button>
              </div>

              {/* Price */}
              <div className="mt-3 flex items-start gap-2 xs:mt-4 md:justify-center lg:justify-start">
                {(product.onSale || product.on_sale) && (product.salePrice || product.sale_price) ? (
                  <>
                    <span className="font-[family-name:var(--font-inter)] text-xl text-white xs:text-2xl lg:text-3xl xl:text-[2rem]">
                      {formatPrice(Number(product.salePrice || product.sale_price))}
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 line-through decoration-white/50 xs:text-sm lg:text-base">
                      {formatPrice(Number(product.price))}
                    </span>
                  </>
                ) : (
                  <span className="font-[family-name:var(--font-inter)] text-xl text-white xs:text-2xl lg:text-3xl xl:text-[2rem]">
                    {formatPrice(Number(product.price))}
                  </span>
                )}
              </div>

              </div>

            {/* Bottom section - Stock, Quantity & Buttons */}
            <div className="mt-5 w-full xs:mt-6 sm:mt-8 lg:mt-0">
            {/* Stock Status - Above quantity */}
            <div className="mb-2 md:text-center lg:text-left">
              {product.inventory > 10 ? (
                <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-xs text-emerald-400 xs:text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  In Stock
                </span>
              ) : product.inventory > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-xs text-amber-400 xs:text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Only {product.inventory} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-xs text-red-400 xs:text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Quantity & In Pouch Badge Row */}
            <div className="flex w-full items-center justify-between md:max-w-md md:justify-center md:gap-8 lg:mb-3 lg:max-w-none lg:justify-between lg:gap-0">
              {/* Quantity Selector */}
              {product.inventory > 0 ? (
                <div className="flex items-center gap-3 xs:gap-4">
                  <span className="font-[family-name:var(--font-inter)] text-sm text-white/50">Qty</span>
                  <div className="flex items-center rounded-lg bg-white/5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-9 w-9 items-center justify-center text-white/70 transition-colors hover:text-white xs:h-10 xs:w-10 sm:h-11 sm:w-11"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-[family-name:var(--font-inter)] text-white xs:w-8 sm:w-10">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                      className="flex h-9 w-9 items-center justify-center text-white/70 transition-colors hover:text-white xs:h-10 xs:w-10 sm:h-11 sm:w-11"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div />
              )}

              {/* In Pouch Badge - Right side */}
              {isInPouch(product.id) && (
                <button
                  onClick={handleRemoveFromPouch}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-500/20 px-2.5 py-1 font-[family-name:var(--font-inter)] text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-500/30"
                >
                  <span>{pouchQuantity} in Pouch</span>
                  <IconTrash size={12} />
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-4 flex w-full flex-col gap-2.5 xs:mt-5 xs:gap-3 md:max-w-md md:flex-row lg:max-w-none">
              <Button
                onClick={handleAddToPouch}
                disabled={product.inventory === 0}
                className={`h-10 w-full rounded-lg px-5 font-[family-name:var(--font-inter)] text-sm transition-all duration-200 xs:h-11 xs:px-6 xs:text-base sm:h-12 md:flex-1 lg:w-auto lg:flex-none lg:px-16 xl:px-20 ${
                  product.inventory === 0
                    ? 'cursor-not-allowed bg-white/20 text-white/50'
                    : secondaryHovered
                      ? 'bg-white/10 text-white'
                      : 'bg-white text-black hover:bg-white/90'
                }`}
                onMouseEnter={() => setSecondaryHovered(false)}
              >
                {product.inventory === 0 ? 'Sold Out' : 'Add to Pouch'}
              </Button>
              <Button
                onClick={handleAddToWishlist}
                variant="outline"
                className={`h-10 w-full rounded-lg border-transparent px-5 font-[family-name:var(--font-inter)] text-sm transition-all duration-200 xs:h-11 xs:px-6 xs:text-base sm:h-12 md:flex-1 lg:w-auto lg:flex-none lg:px-16 xl:px-20 ${
                  secondaryHovered
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                onMouseEnter={() => setSecondaryHovered(true)}
              >
                {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="mt-4 flex items-center justify-center gap-3 xs:mt-5 md:justify-center lg:justify-start">
              <span className="font-[family-name:var(--font-inter)] text-xs text-white/40">Share</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(product.name);
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Share on X"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Share on Facebook"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const title = encodeURIComponent(product.name);
                    window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${title}`, '_blank');
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Share on Pinterest"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Copy link"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-10 xs:mt-12 md:mt-16 lg:mt-20 xl:mt-24">
          <h2 className="mb-3 font-[family-name:var(--font-bacasime)] text-xl text-white xs:mb-4 xs:text-2xl md:text-center lg:text-left lg:text-3xl xl:text-[2rem]">
            Description
          </h2>
          <div className="rounded-xl bg-white/5 p-5 xs:rounded-2xl xs:p-6 sm:p-8 md:mx-auto md:max-w-2xl lg:mx-0 lg:max-w-none lg:p-10 xl:p-12 3xl:max-w-4xl">
            <div
              className="prose prose-invert max-w-none font-[family-name:var(--font-inter)] text-sm text-white/70 prose-p:leading-relaxed xs:text-base"
              dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }}
            />
          </div>
        </div>

        {/* Shipping Info */}
        <div className="mt-10 xs:mt-12 md:mt-16 lg:mt-20 xl:mt-24">
          <h2 className="font-[family-name:var(--font-bacasime)] text-xl text-white xs:text-2xl md:text-center lg:text-left lg:text-3xl xl:text-[2rem]">
            Shipping
          </h2>
          <div className="mt-3 rounded-lg bg-white/5 xs:mt-4 xs:rounded-xl md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-6 lg:max-w-none 3xl:max-w-4xl">
            <div className="flex min-h-9 w-full items-center justify-between border-b border-white/5 px-5 py-2.5 xs:min-h-10 xs:px-6 xs:py-3 sm:min-h-11 sm:px-8">
              <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
                Processing
              </span>
              <span className="font-[family-name:var(--font-inter)] text-xs text-white xs:text-sm">
                1–2 business days
              </span>
            </div>
            <div className="flex min-h-9 w-full items-center justify-between border-b border-white/5 px-5 py-2.5 xs:min-h-10 xs:px-6 xs:py-3 sm:min-h-11 sm:px-8">
              <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
                Canada
              </span>
              <span className="font-[family-name:var(--font-inter)] text-xs text-white xs:text-sm">
                3–15 business days
              </span>
            </div>
            <div className="flex min-h-9 w-full items-center justify-between px-5 py-2.5 xs:min-h-10 xs:px-6 xs:py-3 sm:min-h-11 sm:px-8">
              <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
                USA
              </span>
              <span className="font-[family-name:var(--font-inter)] text-xs text-white xs:text-sm">
                5–20 business days
              </span>
            </div>
          </div>
        </div>

        {/* Product Specs */}
        {(() => {
          const specs = [
            { label: 'Type', value: product.gemstoneType || product.gemstone_type || 'Natural Gemstone' },
            { label: 'Carat Weight', value: product.caratWeight || product.carat_weight || '2.45 ct' },
            { label: 'Cut', value: product.cut || 'Oval Brilliant' },
            { label: 'Clarity', value: product.clarity || 'Eye Clean' },
            { label: 'Color', value: product.color || 'Vivid' },
            { label: 'Origin', value: product.origin || 'Alberta, Canada' },
            { label: 'Treatment', value: product.treatment || 'None (Natural)' },
            { label: 'Certification', value: product.certification || 'GIA' },
            { label: 'Certificate #', value: product.certificationNumber || product.certification_number || 'GIA-2024-78543' },
          ];

          return (
            <div className="mt-10 xs:mt-12 md:mt-16 lg:mt-20 xl:mt-24">
              <h2 className="font-[family-name:var(--font-bacasime)] text-xl text-white xs:text-2xl md:text-center lg:text-left lg:text-3xl xl:text-[2rem]">
                Specifications
              </h2>
              <div className="mt-3 rounded-lg bg-white/5 xs:mt-4 xs:rounded-xl md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-6 lg:max-w-none 3xl:max-w-4xl">
                {specs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={`flex min-h-9 w-full items-center justify-between px-5 py-2.5 xs:min-h-10 xs:px-6 xs:py-3 sm:min-h-11 sm:px-8 ${
                      index !== specs.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <span className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
                      {spec.label}
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-xs text-white xs:text-sm">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Similar Products - Products from the same category */}
        {similarProducts.length > 0 && (
          <div className="mt-10 xs:mt-12 md:mt-16 lg:mt-20 xl:mt-24">
            <h2 className="mb-4 font-[family-name:var(--font-bacasime)] text-xl text-white xs:mb-5 xs:text-2xl md:text-center lg:text-left lg:text-3xl xl:text-[2rem]">
              More {product.category?.name || 'Similar Products'}
            </h2>
            <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 xs:-mx-5 xs:gap-4 xs:px-5 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 lg:gap-5 xl:gap-6">
              {similarProducts.map((item) => {
                const itemImages = item.images?.length > 0 ? item.images : placeholderMedia;
                const isOnSale = item.onSale || item.on_sale;
                const displayPrice = isOnSale && (item.salePrice || item.sale_price)
                  ? Number(item.salePrice || item.sale_price)
                  : Number(item.price) || 0;
                return (
                  <a
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="group flex-shrink-0 w-[45%] xs:w-[42%] sm:w-[35%] md:w-full"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-900 xs:rounded-2xl">
                      <Image
                        src={itemImages[0]}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {item.inventory === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="font-[family-name:var(--font-bacasime)] text-lg text-white/80">SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 xs:mt-3">
                      <h3 className="font-[family-name:var(--font-inter)] text-sm text-white truncate xs:text-base">
                        {item.name}
                      </h3>
                      <p className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
                        {formatPrice(displayPrice)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-10 xs:mt-12 md:mt-16 lg:mt-20 xl:mt-24">
            <h2 className="mb-4 font-[family-name:var(--font-bacasime)] text-xl text-white xs:mb-5 xs:text-2xl md:text-center lg:text-left lg:text-3xl xl:text-[2rem]">
              Recently Viewed
            </h2>
            <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 xs:-mx-5 xs:gap-4 xs:px-5 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 lg:gap-5 xl:gap-6">
              {recentlyViewed.slice(0, 4).map((item) => (
                <a
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group w-[45%] flex-shrink-0 xs:w-[42%] sm:w-[35%] md:w-full"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-900 xs:rounded-2xl">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 xs:mt-3">
                    <h3 className="truncate font-[family-name:var(--font-inter)] text-sm text-white xs:text-base">
                      {item.name}
                    </h3>
                    <p className="font-[family-name:var(--font-inter)] text-xs text-white/50 xs:text-sm">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="mt-10 flex justify-center xs:mt-12 md:mt-16 lg:mt-20">
          <nav className="flex items-center gap-2 font-[family-name:var(--font-inter)] text-xs text-white/40 xs:text-sm">
            <a href="/" className="transition-colors hover:text-white">Home</a>
            <span>/</span>
            <a href="/shop" className="transition-colors hover:text-white">Shop</a>
            <span>/</span>
            {product.category && (
              <>
                <a href={`/shop/${product.category.slug}`} className="transition-colors hover:text-white">
                  {product.category.name}
                </a>
                <span>/</span>
              </>
            )}
            <span className="text-white/60">{product.name}</span>
          </nav>
        </div>

              </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={product.id}
      />

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white/70 transition-colors hover:text-white xs:top-5 xs:right-5 sm:top-6 sm:right-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 xs:h-8 xs:w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="relative h-[85vh] w-[92vw] max-w-4xl overflow-hidden xs:h-[82vh] xs:w-[88vw] sm:h-[80vh] sm:w-[85vw] md:w-[80vw] xl:max-w-5xl 3xl:max-w-6xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${selectedImage * 100}%)` }}
            >
              {images.map((media, index) => (
                <div
                  key={index}
                  className="relative h-full w-full flex-shrink-0 px-4"
                >
                  <div
                    onClick={() => !isVideo(media) && setIsZoomed(false)}
                    className={`relative h-full w-full ${!isVideo(media) ? 'cursor-zoom-out' : ''}`}
                  >
                    {isVideo(media) ? (
                      <video
                        src={media}
                        className="h-full w-full object-contain"
                        controls
                        playsInline
                        autoPlay
                        loop
                      />
                    ) : (
                      <Image
                        src={media}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="80vw"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Thumbnail navigation in modal */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 xs:bottom-5 xs:gap-2 sm:bottom-6">
            {images.map((media, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`relative h-10 w-10 overflow-hidden rounded-md transition-all xs:h-11 xs:w-11 xs:rounded-lg sm:h-12 sm:w-12 ${
                  selectedImage === index
                    ? 'ring-1 ring-white/50'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {isVideo(media) ? (
                  <>
                    <video
                      src={media}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg className="h-4 w-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <Image
                    src={media}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
