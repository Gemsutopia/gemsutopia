'use client';

import Pusher, { Channel } from 'pusher-js';
import { useEffect, useRef, useState, useCallback } from 'react';

// Channel names (mirror server-side)
export const CHANNELS = {
  AUCTIONS: 'auctions',
  AUCTION: (id: string) => `auction-${id}`,
  INVENTORY: 'inventory',
  ORDERS: 'private-orders',
  ADMIN: 'private-admin',
} as const;

// Event names (mirror server-side)
export const EVENTS = {
  BID_PLACED: 'bid-placed',
  AUCTION_ENDED: 'auction-ended',
  AUCTION_CREATED: 'auction-created',
  AUCTION_UPDATED: 'auction-updated',
  STOCK_UPDATED: 'stock-updated',
  PRODUCT_SOLD_OUT: 'product-sold-out',
  LOW_STOCK_ALERT: 'low-stock-alert',
  ORDER_CREATED: 'order-created',
  ORDER_STATUS_UPDATED: 'order-status-updated',
  PAYMENT_RECEIVED: 'payment-received',
  NEW_ORDER: 'new-order',
  NEW_BID: 'new-bid',
  INVENTORY_ALERT: 'inventory-alert',
} as const;

// Singleton Pusher instance
let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (typeof window === 'undefined') return null;

  if (pusherClient) return pusherClient;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    console.warn('Pusher not configured - missing environment variables');
    return null;
  }

  pusherClient = new Pusher(key, {
    cluster,
    authEndpoint: '/api/pusher/auth',
  });

  return pusherClient;
}

// Connection status type
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'failed' | 'unavailable';

// Hook to track Pusher connection status
export function usePusherConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) {
      setStatus('unavailable');
      return;
    }

    const handleStateChange = (states: { current: string; previous: string }) => {
      switch (states.current) {
        case 'connected':
          setStatus('connected');
          setError(null);
          break;
        case 'connecting':
          setStatus('connecting');
          break;
        case 'disconnected':
          setStatus('disconnected');
          break;
        case 'failed':
          setStatus('failed');
          setError('Connection failed');
          break;
        default:
          setStatus('disconnected');
      }
    };

    const handleError = (err: { error: { message: string } }) => {
      setError(err.error?.message || 'Unknown error');
    };

    pusher.connection.bind('state_change', handleStateChange);
    pusher.connection.bind('error', handleError);

    // Set initial status
    setStatus(pusher.connection.state as ConnectionStatus);

    return () => {
      pusher.connection.unbind('state_change', handleStateChange);
      pusher.connection.unbind('error', handleError);
    };
  }, []);

  return { status, error, isConnected: status === 'connected' };
}

// Generic hook to subscribe to a channel and listen for events
export function useChannel(channelName: string) {
  const channelRef = useRef<Channel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      setIsSubscribed(true);
    });

    channel.bind('pusher:subscription_error', () => {
      setIsSubscribed(false);
    });

    return () => {
      pusher.unsubscribe(channelName);
      channelRef.current = null;
      setIsSubscribed(false);
    };
  }, [channelName]);

  const bind = useCallback(
    <T = unknown>(eventName: string, callback: (data: T) => void) => {
      const channel = channelRef.current;
      if (channel) {
        channel.bind(eventName, callback);
        return () => channel.unbind(eventName, callback);
      }
      return () => {};
    },
    []
  );

  return { channel: channelRef.current, isSubscribed, bind };
}

// Hook for listening to a specific event on a channel
export function useEvent<T = unknown>(
  channelName: string,
  eventName: string,
  callback: (data: T) => void
) {
  const { bind, isSubscribed } = useChannel(channelName);

  useEffect(() => {
    const unbind = bind(eventName, callback);
    return unbind;
  }, [bind, eventName, callback]);

  return { isSubscribed };
}

// Auction-specific hooks
export function useAuctionBids(
  auctionId: string,
  onBidPlaced?: (data: {
    auctionId: string;
    bidAmount: number;
    bidCount: number;
    bidderName?: string;
    timestamp: string;
  }) => void
) {
  const { isConnected } = usePusherConnection();
  const { isSubscribed, bind } = useChannel(CHANNELS.AUCTION(auctionId));

  useEffect(() => {
    if (!onBidPlaced) return;

    const unbind = bind(EVENTS.BID_PLACED, onBidPlaced);
    return unbind;
  }, [bind, onBidPlaced]);

  return { isSubscribed, isConnected };
}

export function useAuctionEnd(
  auctionId: string,
  onAuctionEnded?: (data: {
    auctionId: string;
    finalBid: number;
    winnerName?: string;
    endedByBuyNow?: boolean;
  }) => void
) {
  const { isSubscribed, bind } = useChannel(CHANNELS.AUCTION(auctionId));

  useEffect(() => {
    if (!onAuctionEnded) return;

    const unbind = bind(EVENTS.AUCTION_ENDED, onAuctionEnded);
    return unbind;
  }, [bind, onAuctionEnded]);

  return { isSubscribed };
}

// Inventory hook
export function useInventoryUpdates(
  onStockUpdated?: (data: {
    productId: string;
    productName: string;
    oldStock: number;
    newStock: number;
  }) => void,
  onSoldOut?: (data: { productId: string; productName: string }) => void
) {
  const { isSubscribed, bind } = useChannel(CHANNELS.INVENTORY);

  useEffect(() => {
    if (onStockUpdated) {
      const unbind = bind(EVENTS.STOCK_UPDATED, onStockUpdated);
      return unbind;
    }
  }, [bind, onStockUpdated]);

  useEffect(() => {
    if (onSoldOut) {
      const unbind = bind(EVENTS.PRODUCT_SOLD_OUT, onSoldOut);
      return unbind;
    }
  }, [bind, onSoldOut]);

  return { isSubscribed };
}

// All auctions updates (for auction list page)
export function useAuctionsUpdates(callbacks?: {
  onBidPlaced?: (data: {
    auctionId: string;
    bidAmount: number;
    bidCount: number;
    timestamp: string;
  }) => void;
  onAuctionCreated?: (data: { id: string; title: string; startingBid: number }) => void;
}) {
  const { isSubscribed, bind } = useChannel(CHANNELS.AUCTIONS);

  useEffect(() => {
    if (callbacks?.onBidPlaced) {
      const unbind = bind(EVENTS.BID_PLACED, callbacks.onBidPlaced);
      return unbind;
    }
  }, [bind, callbacks?.onBidPlaced]);

  useEffect(() => {
    if (callbacks?.onAuctionCreated) {
      const unbind = bind(EVENTS.AUCTION_CREATED, callbacks.onAuctionCreated);
      return unbind;
    }
  }, [bind, callbacks?.onAuctionCreated]);

  return { isSubscribed };
}

// Admin notifications hook
export function useAdminNotifications(callbacks?: {
  onNewOrder?: (data: {
    orderId: string;
    orderNumber: string;
    total: number;
    itemCount: number;
  }) => void;
  onNewBid?: (data: { auctionId: string; bidAmount: number; bidderName?: string }) => void;
  onInventoryAlert?: (data: {
    productId: string;
    productName: string;
    newStock: number;
    alertType: 'low-stock' | 'sold-out';
  }) => void;
}) {
  const { isSubscribed, bind } = useChannel(CHANNELS.ADMIN);

  useEffect(() => {
    if (callbacks?.onNewOrder) {
      const unbind = bind(EVENTS.NEW_ORDER, callbacks.onNewOrder);
      return unbind;
    }
  }, [bind, callbacks?.onNewOrder]);

  useEffect(() => {
    if (callbacks?.onNewBid) {
      const unbind = bind(EVENTS.NEW_BID, callbacks.onNewBid);
      return unbind;
    }
  }, [bind, callbacks?.onNewBid]);

  useEffect(() => {
    if (callbacks?.onInventoryAlert) {
      const unbind = bind(EVENTS.INVENTORY_ALERT, callbacks.onInventoryAlert);
      return unbind;
    }
  }, [bind, callbacks?.onInventoryAlert]);

  return { isSubscribed };
}
