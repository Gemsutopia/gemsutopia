'use client';

import Pusher, { Channel } from 'pusher-js';
import { useEffect, useRef, useState, useCallback } from 'react';

// Channel names (mirror server-side)
export const CHANNELS = {
  AUCTIONS: 'auctions',
  AUCTION: (_id: string) => 'auctions',
  INVENTORY: 'inventory',
  PRODUCTS: 'products',
  CONTENT: 'content',
} as const;

// Event names (mirror server-side)
export const EVENTS = {
  BID_PLACED: 'auction:bid-placed',
  AUCTION_ENDED: 'auction:ended',
  AUCTION_CREATED: 'auction:created',
  AUCTION_UPDATED: 'auction:extended',
  STOCK_UPDATED: 'inventory:updated',
  PRODUCT_SOLD_OUT: 'inventory:out-of-stock',
  LOW_STOCK_ALERT: 'inventory:low-stock',
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  PRODUCT_BULK_UPDATED: 'product:bulk-updated',
  CONTENT_UPDATED: 'content:updated',
  CONTENT_BULK_UPDATED: 'content:bulk-updated',
  COLLECTIONS_UPDATED: 'collections:updated',
} as const;

// Singleton Pusher instance
let pusherClient: Pusher | null = null;
let pusherInitialization: Promise<Pusher> | null = null;
let workspaceChannelPrefix = '';

type RealtimeConfig = {
  key: string;
  cluster: string;
  channelPrefix: string;
};

async function initializePusher(): Promise<Pusher> {
  if (pusherClient) return pusherClient;
  if (pusherInitialization) return pusherInitialization;

  pusherInitialization = fetch('/api/realtime/config', { cache: 'no-store' })
    .then(async response => {
      if (!response.ok) throw new Error('Realtime configuration is unavailable');
      const payload = await response.json();
      const config = (payload.data || payload) as RealtimeConfig;
      if (!config.key || !config.cluster || !config.channelPrefix) {
        throw new Error('Realtime configuration is incomplete');
      }

      workspaceChannelPrefix = config.channelPrefix;
      pusherClient = new Pusher(config.key, {
        cluster: config.cluster,
        channelAuthorization: {
          endpoint: '/api/realtime/auth',
          transport: 'ajax',
        },
      });
      return pusherClient;
    })
    .catch(error => {
      pusherInitialization = null;
      throw error;
    });

  return pusherInitialization;
}

function resolveChannelName(channelName: string) {
  if (channelName.startsWith('private-workspace-')) return channelName;
  return `${workspaceChannelPrefix}-${channelName}`;
}

export function getPusherClient(): Pusher | null {
  return typeof window === 'undefined' ? null : pusherClient;
}

// Connection status type
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'failed' | 'unavailable';

// Hook to track Pusher connection status
export function usePusherConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let pusher: Pusher | null = null;

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

    setStatus('connecting');
    void initializePusher()
      .then(client => {
        if (disposed) return;
        pusher = client;
        client.connection.bind('state_change', handleStateChange);
        client.connection.bind('error', handleError);
        setStatus(client.connection.state as ConnectionStatus);
      })
      .catch(error => {
        if (disposed) return;
        setStatus('unavailable');
        setError(error instanceof Error ? error.message : 'Realtime connection is unavailable');
      });

    return () => {
      disposed = true;
      pusher?.connection.unbind('state_change', handleStateChange);
      pusher?.connection.unbind('error', handleError);
    };
  }, []);

  return { status, error, isConnected: status === 'connected' };
}

// Generic hook to subscribe to a channel and listen for events
export function useChannel(channelName: string) {
  const channelRef = useRef<Channel | null>(null);
  const resolvedNameRef = useRef('');
  const bindingsRef = useRef(new Map<string, Set<(data: unknown) => void>>());
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!channelName) return;
    let disposed = false;

    void initializePusher().then(pusher => {
      if (disposed) return;
      const resolvedName = resolveChannelName(channelName);
      const channel = pusher.subscribe(resolvedName);
      resolvedNameRef.current = resolvedName;
      channelRef.current = channel;
      bindingsRef.current.forEach((callbacks, eventName) => {
        callbacks.forEach(callback => channel.bind(eventName, callback));
      });
      channel.bind('pusher:subscription_succeeded', () => setIsSubscribed(true));
      channel.bind('pusher:subscription_error', () => setIsSubscribed(false));
    }).catch(() => setIsSubscribed(false));

    return () => {
      disposed = true;
      const pusher = getPusherClient();
      if (pusher && resolvedNameRef.current) pusher.unsubscribe(resolvedNameRef.current);
      channelRef.current = null;
      resolvedNameRef.current = '';
      setIsSubscribed(false);
    };
  }, [channelName]);

  const bind = useCallback(
    <T = unknown>(eventName: string, callback: (data: T) => void) => {
      const genericCallback = callback as (data: unknown) => void;
      const callbacks = bindingsRef.current.get(eventName) || new Set();
      callbacks.add(genericCallback);
      bindingsRef.current.set(eventName, callbacks);
      const channel = channelRef.current;
      channel?.bind(eventName, genericCallback);
      return () => {
        channelRef.current?.unbind(eventName, genericCallback);
        const currentCallbacks = bindingsRef.current.get(eventName);
        currentCallbacks?.delete(genericCallback);
        if (currentCallbacks?.size === 0) bindingsRef.current.delete(eventName);
      };
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
