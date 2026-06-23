'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconSearch,
  IconX,
  IconChevronDown,
  IconTrash,
  IconHeart,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyProducts } from '@/components/empty-states';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/page-loader';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  stock: number;
}

// Hardcoded rare finds products
const RARE_FINDS_PRODUCTS: Product[] = [
  { id: 'rare-1', name: 'Ammolite', price: 299, originalPrice: 299, image: '/images/products/gem.png', stock: 5 },
  { id: 'rare-2', name: 'Labradorite', price: 199, originalPrice: 199, image: '/images/products/gem2.png', stock: 3 },
  { id: 'rare-3', name: 'Opal', price: 349, originalPrice: 349, image: '/images/products/gem3.png', stock: 7 },
  { id: 'rare-4', name: 'Tourmaline', price: 279, originalPrice: 279, image: '/images/products/gem4.png', stock: 4 },
  { id: 'rare-5', name: 'Ruby', price: 599, originalPrice: 599, image: '/images/products/gem7.png', stock: 2 },
  { id: 'rare-6', name: 'Amethyst', price: 149, originalPrice: 149, image: '/images/products/gem8.png', stock: 10 },
  { id: 'rare-7', name: 'Topaz', price: 229, originalPrice: 229, image: '/images/products/gem9.png', stock: 6 },
];

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export default function RareFindsPage() {
  const { formatPrice } = useCurrency();
  const { items: pouchItems, addItem, removeItem, updateQuantity, isInPouch } = useGemPouch();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  const getItemQuantity = (productId: string) => {
    const item = pouchItems.find(i => i.id === productId);
    return item?.quantity || 0;
  };

  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = [minPrice !== '', maxPrice !== '', inStockOnly, onSaleOnly].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('default');
  };

  useEffect(() => {
    // Use hardcoded products for now
    setProducts(RARE_FINDS_PRODUCTS);
    setLoading(false);
  }, []);

  const filteredProducts = products
    .filter(product => {
      if (searchQuery.trim() && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (minPrice !== '' && product.price < parseFloat(minPrice)) return false;
      if (maxPrice !== '' && product.price > parseFloat(maxPrice)) return false;
      if (inStockOnly && product.stock === 0) return false;
      if (onSaleOnly && product.price >= product.originalPrice) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  if (loading) return <PageLoader />;

  if (products.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <main className="flex h-screen flex-col items-center justify-center">
          <EmptyProducts category="Rare Finds" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="flex-grow px-4 pb-16 pt-28 xs:px-5 xs:pt-32 sm:px-6 md:px-12 md:pt-32 lg:px-24 lg:pb-20 lg:pt-36 xl:px-32 3xl:px-40">
        <div className="mx-auto max-w-7xl 3xl:max-w-[1600px]">
          <div className="mb-4 xs:mb-5 md:mb-6">
            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-sm text-white transition-colors hover:text-gray-300 xs:gap-2 xs:text-base">
              <IconArrowLeft size={18} className="xs:h-5 xs:w-5" />
              <span>Back</span>
            </button>
          </div>

          <div className="mb-8 text-center xs:mb-10 md:mb-12">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-3xl text-white xs:mb-4 xs:text-4xl md:text-5xl lg:text-6xl">
              Rare Finds
            </h1>
            <p className="mx-auto mb-3 max-w-2xl font-[family-name:var(--font-inter)] text-base text-white/60 xs:mb-4 xs:text-lg">
              One-of-a-kind specimens you won't find anywhere else
            </p>
            <p className="font-[family-name:var(--font-inter)] text-xs text-white/80 xs:text-sm">
              {products.length} {products.length === 1 ? 'gem' : 'gems'} in this collection
            </p>
          </div>

          <div className="relative z-[50] mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm xs:mb-8 xs:rounded-3xl xs:p-5 md:mb-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
                <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gems..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-10 font-[family-name:var(--font-inter)] text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none xs:h-11"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white">
                    <IconX size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`flex h-10 items-center gap-2 rounded-xl border px-3 font-[family-name:var(--font-inter)] text-sm transition-colors xs:h-11 ${filtersOpen || activeFilterCount > 0 ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 bg-black/30 text-white/70 hover:border-white/20 hover:text-white'}`}
                >
                  <span>Filters</span>
                  {activeFilterCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-black">{activeFilterCount}</span>}
                  <IconChevronDown size={16} className="text-white/60" />
                </button>
                <div className="relative" ref={sortDropdownRef}>
                  <button onClick={() => setSortDropdownOpen(!sortDropdownOpen)} className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 font-[family-name:var(--font-inter)] text-sm text-white transition-colors hover:border-white/20 xs:h-11">
                    <span className="hidden xs:inline">Sort:</span>
                    <span>{sortOptions.find(opt => opt.value === sortBy)?.label || 'Default'}</span>
                    <IconChevronDown size={14} className="text-white/60" />
                  </button>
                  <AnimatePresence>
                    {sortDropdownOpen && (
                      <motion.div className="absolute top-full right-0 z-[999] mt-2" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}>
                        <div className="min-w-[180px] rounded-xl border border-white/10 bg-black/95 p-2 shadow-xl backdrop-blur-xl">
                          {sortOptions.map((option, index) => (
                            <motion.button key={option.value} onClick={() => { setSortBy(option.value); setSortDropdownOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${sortBy === option.value ? 'text-white' : 'text-white/70'}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {filtersOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-[family-name:var(--font-inter)] text-xs text-white/50">Price Range</label>
                        <div className="flex items-center gap-2">
                          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="h-10 w-24 rounded-lg border border-white/10 bg-black/30 px-3 font-[family-name:var(--font-inter)] text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none" />
                          <span className="text-white/40">—</span>
                          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="h-10 w-24 rounded-lg border border-white/10 bg-black/30 px-3 font-[family-name:var(--font-inter)] text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-2">
                          <button onClick={() => setInStockOnly(!inStockOnly)} className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${inStockOnly ? 'bg-white' : 'bg-white/20'}`}>
                            <span className={`h-5 w-5 rounded-full transition-all ${inStockOnly ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/60'}`} />
                          </button>
                          <span className="font-[family-name:var(--font-inter)] text-sm text-white/70">In Stock</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <button onClick={() => setOnSaleOnly(!onSaleOnly)} className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${onSaleOnly ? 'bg-white' : 'bg-white/20'}`}>
                            <span className={`h-5 w-5 rounded-full transition-all ${onSaleOnly ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/60'}`} />
                          </button>
                          <span className="font-[family-name:var(--font-inter)] text-sm text-white/70">On Sale</span>
                        </label>
                      </div>
                      {(activeFilterCount > 0 || searchQuery) && (
                        <button onClick={clearFilters} className="h-10 rounded-lg border border-white/10 bg-black/30 px-4 font-[family-name:var(--font-inter)] text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white">Clear All</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="mt-3 font-[family-name:var(--font-inter)] text-sm text-white/50">
              Showing {filteredProducts.length} of {products.length} gems{searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyProducts category="Rare Finds" />
          ) : (
            <div className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 xs:rounded-2xl">
                  <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-neutral-900">
                    {product.price < product.originalPrice && (
                      <div className="absolute bottom-2 left-2 z-10 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">Sale</div>
                    )}
                    {isInPouch(product.id) ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const item = pouchItems.find(i => i.id === product.id);
                          if (item) {
                            const previousQuantity = item.quantity;
                            const newQuantity = previousQuantity - 1;
                            if (newQuantity <= 0) {
                              removeItem(product.id);
                              toast.success('Removed from Gem Pouch', { description: product.name, action: { label: 'Undo', onClick: () => addItem({ ...item, quantity: undefined } as any, 1) } });
                            } else {
                              updateQuantity(product.id, newQuantity);
                              toast.success('Removed 1 from Gem Pouch', { description: `${product.name} — ${newQuantity} remaining`, action: { label: 'Undo', onClick: () => updateQuantity(product.id, previousQuantity) } });
                            }
                          }
                        }}
                        className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-md bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-white transition-colors hover:bg-neutral-700 xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs"
                      >
                        <span>{getItemQuantity(product.id)}</span>
                        <IconTrash size={12} className="xs:h-3.5 xs:w-3.5" />
                      </button>
                    ) : product.stock > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isInWishlist(product.id)) {
                            removeFromWishlist(product.id);
                            toast.success('Removed from Wishlist', { description: product.name, action: { label: 'Undo', onClick: () => addToWishlist({ id: product.id, name: product.name, price: product.price, image: product.image, inventory: product.stock }) } });
                          } else {
                            addToWishlist({ id: product.id, name: product.name, price: product.price, image: product.image, inventory: product.stock });
                            toast.success('Added to Wishlist', { description: product.name, action: { label: 'Undo', onClick: () => removeFromWishlist(product.id) } });
                          }
                        }}
                        className={`absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors xs:h-8 xs:w-8 ${isInWishlist(product.id) ? 'bg-white/20 text-red-400' : 'bg-black/50 text-white/70 hover:bg-white/20 hover:text-white'}`}
                      >
                        <IconHeart size={16} className="xs:h-[18px] xs:w-[18px]" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    {product.stock > 0 && product.stock <= 3 && (
                      <div className="absolute bottom-2 right-2 z-10 rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white xs:rounded-lg xs:px-2 xs:py-1 xs:text-xs">Only {product.stock} left</div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <span className="font-[family-name:var(--font-bacasime)] text-2xl tracking-wider text-white xs:text-3xl md:text-4xl">SOLD</span>
                      </div>
                    )}
                    <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                  </Link>
                  <div className="p-2.5 xs:p-3">
                    <Link href={`/product/${product.id}`} className="block">
                      <h2 className="font-[family-name:var(--font-inter)] text-xs font-semibold text-white transition-colors hover:text-white/80 xs:text-sm">
                        <span className="xs:hidden">{product.name.length > 18 ? `${product.name.slice(0, 18)}...` : product.name}</span>
                        <span className="hidden xs:inline">{product.name.length > 24 ? `${product.name.slice(0, 24)}...` : product.name}</span>
                      </h2>
                    </Link>
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="font-[family-name:var(--font-inter)] text-xs font-bold text-white xs:text-sm">{formatPrice(product.price)}</span>
                        {product.price < product.originalPrice && <span className="font-[family-name:var(--font-inter)] text-[10px] text-white/40 line-through">{formatPrice(product.originalPrice)}</span>}
                      </div>
                      {product.stock > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const existingItem = pouchItems.find(i => i.id === product.id);
                            const previousQuantity = existingItem?.quantity || 0;
                            addItem({ id: product.id, name: product.name, price: product.price, image: product.image, stock: product.stock });
                            toast.success('Added to Gem Pouch', { description: product.name, action: { label: 'Undo', onClick: () => { if (previousQuantity === 0) { removeItem(product.id); } else { updateQuantity(product.id, previousQuantity); } } } });
                          }}
                          className="group/bag flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 transition-all hover:bg-white xs:h-8 xs:w-8"
                        >
                          <Image src="/icons/bag.svg" alt="" width={14} height={14} className="transition-all group-hover/bag:invert xs:h-4 xs:w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center xs:mt-12 md:mt-16 lg:mt-20">
            <nav className="flex items-center gap-2 font-[family-name:var(--font-inter)] text-xs text-white/40 xs:text-sm">
              <Link href="/" className="transition-colors hover:text-white/60">Home</Link>
              <span>/</span>
              <Link href="/shop" className="transition-colors hover:text-white/60">Shop</Link>
              <span>/</span>
              <span className="text-white/60">Rare Finds</span>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
