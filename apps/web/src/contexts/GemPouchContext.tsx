'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import { useBetterAuth } from './BetterAuthContext';

interface GemPouchItem {
  id: string;
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
  // Sync status
  isSyncing: boolean;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
}

const GemPouchContext = createContext<GemPouchContextType | undefined>(undefined);

const SYNC_DEBOUNCE_MS = 500;
const LOCAL_STORAGE_KEY = 'gemPouch';

export function GemPouchProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GemPouchItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Get auth state
  const { user, isAuthenticated, isLoading: authLoading } = useBetterAuth();

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
    hasInitializedRef.current = true;
  }, [isClient]);

  // Save to localStorage whenever items change (client only)
  useEffect(() => {
    if (!isClient || !hasInitializedRef.current) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items, isClient]);

  // Sync to server (debounced)
  const syncToServer = useCallback(
    async (itemsToSync: GemPouchItem[]) => {
      if (!isAuthenticated) return;

      setSyncStatus('syncing');
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: itemsToSync.map(item => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          }),
        });

        if (response.ok) {
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        } else {
          setSyncStatus('error');
        }
      } catch {
        setSyncStatus('error');
      }
    },
    [isAuthenticated]
  );

  // Debounced sync
  const debouncedSync = useCallback(
    (itemsToSync: GemPouchItem[]) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncToServer(itemsToSync);
      }, SYNC_DEBOUNCE_MS);
    },
    [syncToServer]
  );

  // Merge server cart with local cart on login
  const mergeServerCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestItems: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.ok) {
        // Fetch the merged cart from server
        const cartResponse = await fetch('/api/cart');
        if (cartResponse.ok) {
          const data = await cartResponse.json();
          if (data.success && data.data.items) {
            // Convert server items to local format
            const serverItems: GemPouchItem[] = data.data.items.map(
              (item: {
                productId: string;
                product: { name: string; images?: string[]; quantity?: number };
                quantity: number;
                salePrice: number | null;
                unitPrice: number;
              }) => ({
                id: item.productId,
                name: item.product?.name || 'Unknown Product',
                price: item.salePrice || item.unitPrice,
                image: item.product?.images?.[0] || '',
                quantity: item.quantity,
                stock: item.product?.quantity,
              })
            );
            setItems(serverItems);
            setLastSyncTime(new Date());
            setSyncStatus('synced');
          }
        }
      }
    } catch {
      // Merge failed, keep local items
      setSyncStatus('error');
    }
  }, [isAuthenticated, items]);

  // Handle user login/logout
  useEffect(() => {
    if (authLoading || !isClient || !hasInitializedRef.current) return;

    const currentUserId = user?.id || null;

    // User just logged in
    if (currentUserId && currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      mergeServerCart();
    }

    // User just logged out - keep local items, clear sync state
    if (!currentUserId && lastUserIdRef.current) {
      lastUserIdRef.current = null;
      setSyncStatus('idle');
      setLastSyncTime(null);
    }
  }, [user?.id, authLoading, isClient, mergeServerCart]);

  // Trigger sync when items change (if authenticated)
  useEffect(() => {
    if (isAuthenticated && hasInitializedRef.current && items.length >= 0) {
      debouncedSync(items);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [items, isAuthenticated, debouncedSync]);

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
    if (isAuthenticated) {
      // Clear server cart as well
      fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
    }
  }, [isAuthenticated]);

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

  const isInPouch = useCallback(
    (id: string) => {
      return items.some(item => item.id === id);
    },
    [items]
  );

  // Memoize computed values to prevent unnecessary recalculations
  const itemCount = useMemo(() => items.length, [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const isSyncing = syncStatus === 'syncing';

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
