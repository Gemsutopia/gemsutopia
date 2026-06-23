'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  usePusherConnection,
  useChannel,
  CHANNELS,
  EVENTS,
  getPusherClient,
} from '@/lib/pusher-client';

// Connection status indicator
export function useRealtimeConnection() {
  const { status, error, isConnected } = usePusherConnection();
  const pusherAvailable = !!getPusherClient();

  return {
    status: pusherAvailable ? status : 'polling',
    error,
    isConnected: pusherAvailable ? isConnected : true,
    mode: pusherAvailable ? 'websocket' : 'polling',
  };
}

// Generic data fetching hook with optional Pusher subscription
export function useRealtimeData<T>(
  table: string,
  id?: string,
  options?: {
    pollInterval?: number;
    channel?: string;
    events?: string[];
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, mode } = useRealtimeConnection();

  const fetchData = useCallback(async () => {
    try {
      const endpoint = id ? `/api/${table}/${id}` : `/api/${table}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${table}`);
      }

      const result = await response.json();
      setData(result.data || result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [table, id]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to Pusher channel if available
  const { bind } = useChannel(options?.channel || '');

  useEffect(() => {
    if (!options?.channel || !options?.events || mode !== 'websocket') return;

    const unbindFns = options.events.map(event => bind(event, () => fetchData()));

    return () => {
      unbindFns.forEach(unbind => unbind());
    };
  }, [bind, options?.channel, options?.events, mode, fetchData]);

  // Fallback polling when WebSocket not available
  useEffect(() => {
    if (mode === 'websocket' || !options?.pollInterval) return;

    const interval = setInterval(fetchData, options.pollInterval);
    return () => clearInterval(interval);
  }, [mode, options?.pollInterval, fetchData]);

  const update = async (updateData: Partial<T>) => {
    if (!id) {
      throw new Error('Cannot update without specific ID');
    }

    // Optimistic update
    setData(prev => (prev ? { ...prev, ...updateData } : null));
    return true;
  };

  const refetch = () => fetchData();

  return {
    data,
    loading,
    error,
    isConnected,
    update,
    refetch,
  };
}

// Auction-specific hook with real-time bid updates
export function useRealtimeAuction(id: string) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastBidRef = useRef<number>(0);
  const { mode } = useRealtimeConnection();

  const fetchAuction = useCallback(async () => {
    try {
      const response = await fetch(`/api/auctions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch auction');

      const result = await response.json();
      const auctionData = result.data?.auction || result.auction || result.data || result;
      setData(auctionData);
      lastBidRef.current = parseFloat(auctionData?.currentBid || '0');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  // Subscribe to auction channel for bid updates
  const { bind, isSubscribed } = useChannel(CHANNELS.AUCTION(id));

  useEffect(() => {
    if (mode !== 'websocket') return;

    // Listen for bid updates
    const unbindBid = bind(
      EVENTS.BID_PLACED,
      (bidData: { bidAmount: number; bidCount: number }) => {
        setData(prev =>
          prev
            ? {
                ...prev,
                currentBid: String(bidData.bidAmount),
                bidCount: bidData.bidCount,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        lastBidRef.current = bidData.bidAmount;
      }
    );

    // Listen for auction end
    const unbindEnd = bind(
      EVENTS.AUCTION_ENDED,
      (endData: { finalBid: number; endedByBuyNow?: boolean }) => {
        setData(prev =>
          prev
            ? {
                ...prev,
                status: 'ended',
                isActive: false,
                currentBid: String(endData.finalBid),
              }
            : null
        );
      }
    );

    return () => {
      unbindBid();
      unbindEnd();
    };
  }, [bind, mode]);

  // Fallback polling when WebSocket not available
  useEffect(() => {
    if (mode === 'websocket') return;

    const interval = setInterval(fetchAuction, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [mode, fetchAuction]);

  const update = async (updateData: Partial<Record<string, unknown>>) => {
    setData(prev => (prev ? { ...prev, ...updateData } : null));
    return true;
  };

  return {
    data,
    loading,
    error,
    isConnected: mode === 'websocket' ? isSubscribed : true,
    update,
    refetch: fetchAuction,
  };
}

export function useRealtimeAuctions() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useRealtimeConnection();

  const fetchAuctions = useCallback(async () => {
    try {
      const response = await fetch('/api/auctions');
      if (!response.ok) throw new Error('Failed to fetch auctions');

      const result = await response.json();
      setData(result.data?.auctions || result.auctions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Subscribe to auctions channel for updates
  const { bind, isSubscribed } = useChannel(CHANNELS.AUCTIONS);

  useEffect(() => {
    if (mode !== 'websocket') return;

    // Listen for bid updates across all auctions
    const unbindBid = bind(
      EVENTS.BID_PLACED,
      (bidData: { auctionId: string; bidAmount: number; bidCount: number }) => {
        setData(prev =>
          prev?.map(auction =>
            auction.id === bidData.auctionId
              ? {
                  ...auction,
                  currentBid: String(bidData.bidAmount),
                  bidCount: bidData.bidCount,
                }
              : auction
          ) || null
        );
      }
    );

    // Listen for new auctions
    const unbindCreated = bind(EVENTS.AUCTION_CREATED, () => {
      // Refetch to get full auction data
      fetchAuctions();
    });

    return () => {
      unbindBid();
      unbindCreated();
    };
  }, [bind, mode, fetchAuctions]);

  // Fallback polling
  useEffect(() => {
    if (mode === 'websocket') return;

    const interval = setInterval(fetchAuctions, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [mode, fetchAuctions]);

  return {
    data,
    loading,
    error,
    isConnected: mode === 'websocket' ? isSubscribed : true,
    refetch: fetchAuctions,
  };
}

export function useRealtimeProduct(id: string) {
  return useRealtimeData<Record<string, unknown>>('products', id, {
    pollInterval: 60000, // 1 minute fallback
    channel: CHANNELS.INVENTORY,
    events: [EVENTS.STOCK_UPDATED],
  });
}

export function useRealtimeProducts() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useRealtimeConnection();

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');

      const result = await response.json();
      setData(result.products || result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Subscribe to inventory channel
  const { bind, isSubscribed } = useChannel(CHANNELS.INVENTORY);

  useEffect(() => {
    if (mode !== 'websocket') return;

    const unbind = bind(
      EVENTS.STOCK_UPDATED,
      (stockData: { productId: string; newStock: number }) => {
        setData(prev =>
          prev?.map(product =>
            product.id === stockData.productId
              ? { ...product, inventory: stockData.newStock }
              : product
          ) || null
        );
      }
    );

    return unbind;
  }, [bind, mode]);

  return {
    data,
    loading,
    error,
    isConnected: mode === 'websocket' ? isSubscribed : true,
    refetch: fetchProducts,
  };
}

export function useRealtimeCategories() {
  return useRealtimeData<Record<string, unknown>[]>('categories', undefined, {
    pollInterval: 300000, // 5 minutes fallback (categories rarely change)
  });
}

export function useRealtimeOrders() {
  return useRealtimeData<Record<string, unknown>[]>('orders', undefined, {
    pollInterval: 30000, // 30 seconds fallback
    channel: CHANNELS.ORDERS,
    events: [EVENTS.ORDER_STATUS_UPDATED],
  });
}

export function useRealtimeBids(auctionId?: string) {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useRealtimeConnection();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const endpoint = auctionId ? `/api/auctions/${auctionId}/bids` : '/api/bids';
        const response = await fetch(endpoint);

        if (!response.ok) throw new Error('Failed to fetch bids');

        const result = await response.json();
        setData(result.bids || result.data || result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();

    // Fallback polling when WebSocket not available
    if (mode !== 'websocket') {
      const interval = setInterval(fetchBids, 5000);
      return () => clearInterval(interval);
    }
  }, [auctionId, mode]);

  return {
    data,
    loading,
    error,
    isConnected: true,
  };
}

// Bidding hook for auction interactions
export function useRealtimeBidding(auctionId: string) {
  const auction = useRealtimeAuction(auctionId);
  const bids = useRealtimeBids(auctionId);

  const placeBid = async (bidAmount: number) => {
    // Optimistic update
    await auction.update({
      currentBid: String(bidAmount),
      bidCount: ((auction.data?.bidCount as number) || 0) + 1,
      updatedAt: new Date().toISOString(),
    });

    return true;
  };

  return {
    auction: auction.data,
    bids: bids.data,
    loading: auction.loading || bids.loading,
    placeBid,
    isConnected: auction.isConnected,
  };
}

// Inventory hook with real-time updates
export function useRealtimeInventory(productId?: string) {
  const products = useRealtimeProducts();
  const { mode } = useRealtimeConnection();

  const updateInventory = async (_id: string, _newStock: number) => {
    // TODO: Implement inventory update API call
    return true;
  };

  const decreaseStock = async (id: string, amount: number = 1) => {
    const product = Array.isArray(products.data)
      ? products.data.find((p: Record<string, unknown>) => p.id === id)
      : null;
    if (product && (product.inventory as number) >= amount) {
      return updateInventory(id, (product.inventory as number) - amount);
    }
    return false;
  };

  const increaseStock = async (id: string, amount: number = 1) => {
    const product = Array.isArray(products.data)
      ? products.data.find((p: Record<string, unknown>) => p.id === id)
      : null;
    if (product) {
      return updateInventory(id, (product.inventory as number) + amount);
    }
    return false;
  };

  const getStock = (id: string) => {
    const product = Array.isArray(products.data)
      ? products.data.find((p: Record<string, unknown>) => p.id === id)
      : null;
    return (product?.inventory as number) || 0;
  };

  return {
    products: products.data,
    loading: products.loading,
    updateInventory,
    decreaseStock,
    increaseStock,
    getStock,
    mode,
  };
}
