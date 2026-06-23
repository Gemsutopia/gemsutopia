'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCMSContent } from '@/hooks/useCMSContent';
import { useCurrency } from '@/contexts/CurrencyContext';
import '../../styles/featured.css';
import { Spinner } from '@/components/ui/spinner';

interface FeaturedProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url: string;
  card_color?: string;
  price: number;
  original_price: number;
  product_id?: string;
  sort_order: number;
  inventory: number;
  is_active: boolean;
}

export default function Featured() {
  const { getContent } = useCMSContent();
  const { formatPrice } = useCurrency();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animation logic for smooth infinite scroll
  useEffect(() => {
    if (!isClient || featuredProducts.length <= 4 || !containerRef.current) return;

    let animationId: number;
    const startTime = performance.now();
    const container = containerRef.current;

    // Calculate dimensions for featured cards
    const cardWidth =
      typeof window !== 'undefined' && window.innerWidth < 768
        ? window.innerWidth * 0.8 + 16 // Mobile: 80vw + margins
        : typeof window !== 'undefined' && window.innerWidth < 1024
          ? window.innerWidth * 0.3333 + 24 // Medium: 33.33vw + margins
          : typeof window !== 'undefined'
            ? window.innerWidth * 0.25 + 24
            : 300; // Large: 25vw + margins, fallback to 300
    const oneSetWidth = featuredProducts.length * cardWidth;

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const speed = 45; // pixels per second
      const translateX = -(elapsed * speed);

      // Better normalization to prevent glitches
      let normalizedTranslateX = 0;
      if (oneSetWidth > 0) {
        const rawMod = translateX % oneSetWidth;
        normalizedTranslateX = rawMod <= -oneSetWidth ? rawMod + oneSetWidth : rawMod;
      }

      // Directly update the transform without causing React re-renders
      container.style.transform = `translate3d(${normalizedTranslateX}px, 0, 0)`;

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isClient, featuredProducts]);

  // Fetch featured products from database
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/featured-products');
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }
        const data = await response.json();
        // Handle standardized API response format
        const products = data.data?.featuredProducts || data.featuredProducts || data || [];
        setFeaturedProducts(products);
      } catch {
        // Fallback to empty array
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Product card component to avoid duplication
  const ProductCard = ({ product }: { product: FeaturedProduct }) => {
    const isOnSale = product.price < product.original_price;
    const isSoldOut = product.inventory === 0;
    const isLowStock = product.inventory > 0 && product.inventory <= 3;
    const productLink = `/product/${product.product_id || product.id}`;

    return (
      <Link
        href={productLink}
        className={`group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 xs:rounded-2xl ${
          isSoldOut ? 'pointer-events-none' : 'hover:border-white/20 hover:bg-white/10'
        }`}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-900">
          {/* Sale Badge - Bottom Left */}
          {isOnSale && !isSoldOut && (
            <div className="absolute bottom-2 left-2 z-10 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
              Sale
            </div>
          )}
          {/* Low Stock Badge - Bottom Right */}
          {isLowStock && (
            <div className="absolute bottom-2 right-2 z-10 rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">
              Only {product.inventory} left
            </div>
          )}
          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="font-[family-name:var(--font-bacasime)] text-2xl tracking-wider text-white xs:text-3xl md:text-4xl">
                SOLD
              </span>
            </div>
          )}
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Product Info */}
        <div className="p-2.5 xs:p-3">
          {/* Name */}
          <h3 className="font-[family-name:var(--font-inter)] text-xs font-semibold text-white xs:text-sm">
            <span className="xs:hidden">
              {product.name.length > 18 ? `${product.name.slice(0, 18)}...` : product.name}
            </span>
            <span className="hidden xs:inline">
              {product.name.length > 24 ? `${product.name.slice(0, 24)}...` : product.name}
            </span>
          </h3>

          {/* Price Row */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-[family-name:var(--font-inter)] text-xs font-bold text-white xs:text-sm">
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <span className="font-[family-name:var(--font-inter)] text-[10px] text-white/40 line-through xs:text-xs">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (isLoading) {
    return (
      <section className="py-10 xs:py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 md:px-12 lg:px-8 3xl:max-w-[1600px]">
          <div className="mb-5 text-center xs:mb-6 md:mb-10 lg:mb-12">
            <h2 className="mb-3 font-[family-name:var(--font-bacasime)] text-2xl text-white xs:mb-4 xs:text-3xl md:text-4xl lg:text-5xl">
              {getContent('featured', 'section_title') || 'Featured Gems'}
            </h2>
            <p className="mx-auto max-w-2xl font-[family-name:var(--font-inter)] text-base text-white/60 xs:text-lg">
              {getContent('featured', 'section_description') ||
                'Discover our curated collection of premium gemstones'}
            </p>
          </div>
          <div className="flex justify-center">
            <Spinner size="48" />
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="py-10 xs:py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 md:px-12 lg:px-8 3xl:max-w-[1600px]">
          <div className="text-center">
            <h2 className="mb-3 font-[family-name:var(--font-bacasime)] text-2xl text-white xs:mb-4 xs:text-3xl md:text-4xl lg:text-5xl">
              {getContent('featured', 'section_title') || 'Featured Gems'}
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-base text-white/60 xs:text-lg">
              No featured products available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 xs:py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 md:px-12 lg:px-8 3xl:max-w-[1600px]">
        <div className="mb-5 text-center xs:mb-6 md:mb-10 lg:mb-12">
          <h2 className="mb-3 font-[family-name:var(--font-bacasime)] text-2xl text-white xs:mb-4 xs:text-3xl md:text-4xl lg:text-5xl">
            {getContent('featured', 'section_title') || 'Featured Gems'}
          </h2>
          <p className="mx-auto max-w-2xl font-[family-name:var(--font-inter)] text-base text-white/60 xs:text-lg">
            {getContent('featured', 'section_description') ||
              'Discover our curated collection of premium gemstones'}
          </p>
        </div>
      </div>

      {/* Featured Products Display */}
      <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
        {(() => {
          const shouldCenter = featuredProducts.length <= 4;

          if (shouldCenter) {
            // Centered layout for 4 or fewer items
            return (
              <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 xs:gap-4 md:grid-cols-4 md:gap-5 lg:gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            );
          } else {
            // Scrolling layout for more than 4 items
            return (
              <div className="overflow-hidden py-4">
                <div ref={containerRef} className="featured-carousel flex">
                  {featuredProducts
                    .concat(featuredProducts)
                    .concat(featuredProducts)
                    .map((product, index) => (
                      <div
                        key={`${product.id}-${index}`}
                        className="inline-block w-[45vw] flex-shrink-0 px-1.5 xs:w-[40vw] xs:px-2 md:w-[30vw] lg:w-[22vw]"
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                </div>
              </div>
            );
          }
        })()}
      </div>
    </section>
  );
}
