'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { useBetterAuth } from '@/contexts/BetterAuthContext';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inventory?: number;
  stock?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  itemCount: number;
  removeSoldOutItems: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipNextSync = useRef(false);
  const { user } = useBetterAuth();

  // Set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    if (!isClient) return;

    const savedItems = localStorage.getItem('wishlist');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch {
        // Corrupted data
      }
    }
  }, [isClient]);

  // Save to localStorage whenever items change (client only)
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items, isClient]);

  // Sync with server when user logs in (merge local + server)
  useEffect(() => {
    if (!isClient || !user || hasSynced) return;

    const syncFromServer = async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (!res.ok) return;

        const data = await res.json();
        const serverItems: WishlistItem[] = data.data?.items || [];

        setItems(prev => {
          // Merge: server items + any local items not on server
          const serverIds = new Set(serverItems.map(i => i.id));
          const localOnly = prev.filter(i => !serverIds.has(i.id));
          const merged = [...serverItems, ...localOnly];

          // If there were local-only items, sync them back to server
          if (localOnly.length > 0) {
            skipNextSync.current = false; // Allow the next sync
            syncToServer(merged);
          }

          return merged;
        });

        setHasSynced(true);
      } catch {
        // Silent fail - localStorage is the fallback
      }
    };

    syncFromServer();
  }, [isClient, user, hasSynced]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!user) {
      setHasSynced(false);
    }
  }, [user]);

  // Debounced sync to server
  const syncToServer = useCallback(
    (itemsToSync: WishlistItem[]) => {
      if (!user) return;

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch('/api/wishlist', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: itemsToSync.map(i => ({ id: i.id, price: i.price })),
            }),
          });
        } catch {
          // Silent fail
        }
      }, 1000);
    },
    [user]
  );

  // Trigger sync when items change (after initial load)
  useEffect(() => {
    if (!isClient || !user || !hasSynced) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    syncToServer(items);
  }, [items, isClient, user, hasSynced, syncToServer]);

  const addItem = (item: WishlistItem) => {
    if (
      (item.inventory !== undefined && item.inventory === 0) ||
      (item.stock !== undefined && item.stock === 0)
    ) {
      toast.error('Item is sold out');
      return;
    }

    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const removeSoldOutItems = () => {
    const soldOutItems = items.filter(
      item =>
        (item.inventory !== undefined && item.inventory === 0) ||
        (item.stock !== undefined && item.stock === 0)
    );

    if (soldOutItems.length > 0) {
      toast.warning(
        soldOutItems.length === 1
          ? 'Wishlist item sold out'
          : `${soldOutItems.length} wishlist items sold out`,
        {
          description: soldOutItems.map(i => i.name).join(', '),
        }
      );
    }

    setItems(prev =>
      prev.filter(
        item =>
          !(
            (item.inventory !== undefined && item.inventory === 0) ||
            (item.stock !== undefined && item.stock === 0)
          )
      )
    );
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  };

  const itemCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist,
        itemCount,
        removeSoldOutItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
