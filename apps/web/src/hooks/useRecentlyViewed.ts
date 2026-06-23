'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gemsutopia_recently_viewed';
const MAX_ITEMS = 12;

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentProduct[];
        setItems(parsed);
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Add a product to recently viewed
  const addViewed = useCallback((product: Omit<RecentProduct, 'viewedAt'>) => {
    setItems(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      // Add to front
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      // Persist
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage full or unavailable
      }
      return updated;
    });
  }, []);

  // Get items excluding a specific product (useful on product page)
  const getExcluding = useCallback(
    (excludeId: string) => items.filter(p => p.id !== excludeId),
    [items]
  );

  return { items, addViewed, getExcluding };
}
