'use client';

import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface ProductMarqueeProps {
  products: Product[];
}

export default function ProductMarquee({ products }: ProductMarqueeProps) {
  const { formatPriceNoSuffix, currency } = useCurrency();
  const { addItem } = useGemPouch();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();

  const cardWidth = 380;
  const gap = 24;
  const totalCards = products.length;
  const setWidth = totalCards * cardWidth + (totalCards - 1) * gap;
  const scrollDistance = setWidth + gap;

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      });
    }
  };

  const renderCard = (product: Product, suffix: string) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    const isSoldOut = product.stock <= 0;

    return (
      <Link
        key={`${product.id}-${suffix}`}
        href={`/product/${product.id}`}
        className="product-card transition-all duration-300 hover:z-50 hover:-translate-y-2 hover:border-white/30 hover:bg-white/10"
        style={{
          width: `${cardWidth}px`,
          flexShrink: 0,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          display: 'block',
        }}
      >
        <div style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-md bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                Sold Out
              </span>
            </div>
          )}
          {/* Wishlist button */}
          <button
            onClick={(e) => handleToggleWishlist(e, product)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? (
              <IconHeartFilled size={16} className="text-white" />
            ) : (
              <IconHeart size={16} className="text-white" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-[family-name:var(--font-inter)] text-sm font-medium text-white">
              {product.name}
            </h3>
            <p className="mt-1 font-[family-name:var(--font-inter)] text-sm font-bold text-white">
              {formatPriceNoSuffix(product.price)}{' '}
              <span className="text-xs font-normal text-white/60">{currency}</span>
            </p>
          </div>
          {/* Add to cart button */}
          <button
            onClick={(e) => handleAddToCart(e, product)}
            disabled={isSoldOut}
            className="ml-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add to cart"
          >
            <img src="/icons/bag.svg" alt="Add to cart" className="h-4 w-4" />
          </button>
        </div>
      </Link>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes marquee-scroll-${totalCards} {
            0% { transform: translateX(0); }
            100% { transform: translateX(-${scrollDistance}px); }
          }
        `}
      </style>
      <div style={{ overflow: 'visible', overflowX: 'clip', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            gap: `${gap}px`,
            width: 'max-content',
            animation: `marquee-scroll-${totalCards} ${Math.max(90, Math.round(scrollDistance / 22))}s linear infinite`,
            willChange: 'transform',
          }}
        >
          {products.map(p => renderCard(p, 'a'))}
          {products.map(p => renderCard(p, 'b'))}
        </div>
      </div>
    </>
  );
}
