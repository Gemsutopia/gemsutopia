'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconSearch, IconX, IconChevronDown } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/page-loader';
import { EmptyState } from '@/components/empty-states';
import { store, type Category as StorefrontCategory } from '@/lib/store';

// Extended category type for UI display
interface Category extends Omit<StorefrontCategory, 'sortOrder'> {
  sortOrder: number;
  isActive: boolean;
  product_count?: number;
  available_count?: number;
  all_sold_out?: boolean;
}

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'count-high', label: 'Most Gems' },
  { value: 'count-low', label: 'Fewest Gems' },
];

export default function Shop() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let result = categories;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'count-high':
        result = [...result].sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
        break;
      case 'count-low':
        result = [...result].sort((a, b) => (a.product_count || 0) - (b.product_count || 0));
        break;
      default:
        result = [...result].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return result;
  }, [categories, searchQuery, sortBy]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch from Quickdash Storefront API
        const { categories: cats } = await store.categories.list({ count: true });
        // Map to local format
        const mapped: Category[] = cats.map((c) => ({
          ...c,
          sortOrder: c.sortOrder ?? 0,
          isActive: true, // API only returns active categories
          product_count: c.productCount,
        }));
        setCategories(mapped);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="flex-grow px-4 pb-16 pt-28 xs:px-5 xs:pt-32 sm:px-6 md:px-12 md:pt-32 lg:px-24 lg:pb-20 lg:pt-36 xl:px-32 3xl:px-40">
        <div className="mx-auto max-w-7xl 3xl:max-w-[1600px]">
          {/* Page Header */}
          <div className="mb-6 text-center xs:mb-8 md:mb-10 lg:mb-12">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-3xl text-white xs:mb-4 xs:text-4xl md:text-5xl lg:text-6xl">
              Shop
            </h1>
            <p className="mx-auto max-w-2xl font-[family-name:var(--font-inter)] text-sm text-white/60 xs:text-base md:text-lg">
              Explore our curated collection of rare gemstones, minerals, and collector specimens
            </p>
          </div>

          {/* Search and Filter Card */}
          <div className="relative z-[50] mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm xs:mb-8 xs:rounded-3xl xs:p-5 md:mb-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Input */}
              <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
                <IconSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-10 font-[family-name:var(--font-inter)] text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none xs:h-11"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                  >
                    <IconX size={16} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown - Custom */}
              <div className="relative ml-auto flex items-center gap-2 sm:ml-0" ref={sortDropdownRef}>
                <span className="font-[family-name:var(--font-inter)] text-xs text-white/40 xs:text-sm">
                  Sort by
                </span>
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 font-[family-name:var(--font-inter)] text-sm text-white transition-colors hover:border-white/20 xs:h-11"
                >
                  <span>{sortOptions.find(opt => opt.value === sortBy)?.label || 'Default'}</span>
                  <IconChevronDown
                    size={14}
                    className={`text-white/60 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {sortDropdownOpen && (
                    <motion.div
                      className="absolute top-full right-0 z-[999] mt-2"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="min-w-[140px] rounded-xl border border-white/10 bg-black/90 p-2 backdrop-blur-xl">
                        {sortOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setSortDropdownOpen(false);
                            }}
                            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                              sortBy === option.value ? 'text-white' : 'text-white/70'
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Results Count - inside card */}
            {!loading && searchQuery && (
              <p className="mt-3 font-[family-name:var(--font-inter)] text-sm text-white/50">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && <PageLoader fullScreen={false} />}

          {/* Categories Grid - 4 columns on desktop, 2 on mobile */}
          {!loading && (
            <div className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className={`group h-full ${category.all_sold_out ? 'pointer-events-none' : ''}`}
                >
                  <div className={`flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 xs:rounded-2xl ${category.all_sold_out ? 'cursor-not-allowed' : 'hover:border-white/20 hover:bg-white/10'}`}>
                    {/* Category Image */}
                    <div className="relative aspect-square overflow-hidden bg-neutral-900">
                      <Image
                        src={category.image || '/images/products/gem.png'}
                        alt={category.name}
                        fill
                        className={`object-cover transition-transform duration-300 ${category.all_sold_out ? '' : 'group-hover:scale-105'}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* Sold Out Overlay */}
                      {category.all_sold_out && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <span className="font-[family-name:var(--font-bacasime)] text-2xl tracking-wider text-white xs:text-3xl md:text-4xl">
                            SOLD
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="flex flex-1 flex-col p-3 xs:p-4">
                      <h2 className="font-[family-name:var(--font-inter)] text-sm font-semibold text-white xs:text-base md:text-lg">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="mt-0.5 line-clamp-2 font-[family-name:var(--font-inter)] text-xs text-white/50 xs:mt-1 xs:text-sm md:line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <p className="mt-auto pt-1.5 font-[family-name:var(--font-inter)] text-xs text-white/40 xs:pt-2">
                        {category.all_sold_out ? 'All sold out' : `${category.product_count ?? 0} gems`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCategories.length === 0 && (
            <EmptyState
              title={searchQuery ? 'No Results Found' : 'No Categories Available'}
              description={
                searchQuery
                  ? `No categories match "${searchQuery}". Try a different search.`
                  : 'Check back soon! New collections are added regularly.'
              }
              action={searchQuery ? { label: 'Clear Search', onClick: () => setSearchQuery('') } : undefined}
            />
          )}

          {/* Breadcrumbs */}
          <div className="mt-10 flex justify-center xs:mt-12 md:mt-16 lg:mt-20">
            <nav className="flex items-center gap-2 font-[family-name:var(--font-inter)] text-xs text-white/40 xs:text-sm">
              <a href="/" className="transition-colors hover:text-white/60">Home</a>
              <span>/</span>
              <span className="text-white/60">Shop</span>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
