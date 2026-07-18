'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { toast } from 'sonner';

interface GemPouchItem {
  id: string;
  variantId?: string;
  sku?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
  inventory?: number;
}

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface GemPouchContextType {
  items: GemPouchItem[];
  addItem: (item: Omit<GemPouchItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearPouch: () => void;
  isInPouch: (id: string) => boolean;
  itemCount: number;
  totalItems: number;
  removeSoldOutItems: (soldOutItemIds: string[]) => void;
  reconcileItemStock: (id: string, stock: number) => void;
  // Sync status
  isSyncing: boolean;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
}

const GemPouchContext = createContext<GemPouchContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'gemPouch';

export function GemPouchProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GemPouchItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    if (!isClient) return;

    const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch {
        // Invalid JSON, clear it
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setHasInitialized(true);
  }, [isClient]);

  // Save to localStorage whenever items change (client only)
  useEffect(() => {
    if (!isClient || !hasInitialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items, isClient, hasInitialized]);

  const addItem = useCallback(
    (item: Omit<GemPouchItem, 'quantity'>, quantity: number = 1) => {
      // Prevent adding sold out items to cart
      if (
        (item.inventory !== undefined && item.inventory === 0) ||
        (item.stock !== undefined && item.stock === 0)
      ) {
        toast.error('Item is sold out');
        return;
      }

      setItems(prev => {
        const existingItem = prev.find(i => i.id === item.id);
        if (existingItem) {
          // Increase quantity if item already exists, but respect stock limit
          const newQuantity = existingItem.quantity + quantity;
          const maxQuantity = item.stock ? Math.min(newQuantity, item.stock) : newQuantity;
          if (maxQuantity === existingItem.quantity) {
            toast.warning('Maximum quantity reached');
          }
          return prev.map(i => (i.id === item.id ? { ...i, quantity: maxQuantity } : i));
        } else {
          // Add new item with specified quantity
          const initialQuantity = item.stock ? Math.min(quantity, item.stock) : quantity;
          return [...prev, { ...item, quantity: initialQuantity }];
        }
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      setItems(prev =>
        prev.map(item => {
          if (item.id === id) {
            // Respect stock limit if available
            const maxQuantity = item.stock ? Math.min(quantity, item.stock) : quantity;
            return { ...item, quantity: maxQuantity };
          }
          return item;
        })
      );
    },
    [removeItem]
  );

  const clearPouch = useCallback(() => {
    setItems([]);
  }, []);

  const removeSoldOutItems = useCallback((soldOutItemIds: string[]) => {
    if (soldOutItemIds.length === 0) {
      return;
    }

    setItems(prev => {
      const soldOutItems = prev.filter(item => soldOutItemIds.includes(item.id));
      if (soldOutItems.length > 0) {
        toast.warning(
          soldOutItems.length === 1
            ? 'Item removed (sold out)'
            : `${soldOutItems.length} items removed (sold out)`,
          {
            description: soldOutItems.map(i => i.name).join(', '),
          }
        );
      }
      return prev.filter(item => !soldOutItemIds.includes(item.id));
    });
  }, []);

  const reconcileItemStock = useCallback((id: string, stock: number) => {
    const availableStock = Math.max(0, Math.floor(stock));
    setItems(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, stock: availableStock, inventory: availableStock, quantity: Math.min(item.quantity, availableStock) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }, []);

  const isInPouch = useCallback(
    (id: string) => {
      return items.some(item => item.id === id);
    },
    [items]
  );

  // Memoize computed values to prevent unnecessary recalculations
  const itemCount = useMemo(() => items.length, [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const syncStatus: SyncStatus = 'idle';
  const lastSyncTime = null;
  const isSyncing = false;

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearPouch,
      isInPouch,
      itemCount,
      totalItems,
      removeSoldOutItems,
      reconcileItemStock,
      isSyncing,
      syncStatus,
      lastSyncTime,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearPouch,
      isInPouch,
      itemCount,
      totalItems,
      removeSoldOutItems,
      reconcileItemStock,
      isSyncing,
      syncStatus,
      lastSyncTime,
    ]
  );

  return <GemPouchContext.Provider value={value}>{children}</GemPouchContext.Provider>;
}

export function useGemPouch() {
  const context = useContext(GemPouchContext);
  if (context === undefined) {
    throw new Error('useGemPouch must be used within a GemPouchProvider');
  }
  return context;
}
