'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { store } from '@/lib/store';

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
        const { wishlist } = await store.wishlist.list();
        const serverItems: WishlistItem[] = wishlist.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: Number.parseFloat(item.product.price),
          image: item.product.thumbnail || item.product.images?.[0] || '',
          stock: item.product.isActive === false ? 0 : undefined,
        }));

        setItems(prev => {
          const serverIds = new Set(serverItems.map(i => i.id));
          const localOnly = prev.filter(i => !serverIds.has(i.id));
          void Promise.allSettled(localOnly.map(item => store.wishlist.add(item.id)));
          return [...serverItems, ...localOnly];
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
      if (user) {
        void store.wishlist.add(item.id).catch(() => {
          toast.error('Could not save this item to your account');
        });
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (user) {
      void store.wishlist.remove(id).catch(() => {
        toast.error('Could not update your account wishlist');
      });
    }
  };

  const clearWishlist = () => {
    if (user) {
      void Promise.allSettled(items.map(item => store.wishlist.remove(item.id)));
    }
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
