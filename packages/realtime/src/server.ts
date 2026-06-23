import Pusher from 'pusher';
import { CHANNELS, EVENTS } from './channels';

// Server-side Pusher instance for triggering events
let pusherServer: Pusher | null = null;

function getPusherServer(): Pusher | null {
  if (pusherServer) return pusherServer;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    console.warn('Pusher not configured - missing environment variables');
    return null;
  }

  pusherServer = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherServer;
}

// Trigger event on a channel
export async function triggerEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const pusher = getPusherServer();
  if (!pusher) {
    console.warn('Pusher not available - event not sent:', { channel, event });
    return false;
  }

  try {
    await pusher.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error('Failed to trigger Pusher event:', error);
    return false;
  }
}

// Auction events
export async function triggerBidPlaced(
  auctionId: string,
  data: {
    bidAmount: number;
    bidCount: number;
    bidderName?: string;
    timestamp: string;
  }
): Promise<boolean> {
  const results = await Promise.all([
    triggerEvent(CHANNELS.AUCTION(auctionId), EVENTS.BID_PLACED, { auctionId, ...data }),
    triggerEvent(CHANNELS.AUCTIONS, EVENTS.BID_PLACED, { auctionId, ...data }),
    triggerEvent(CHANNELS.ADMIN, EVENTS.NEW_BID, { auctionId, ...data }),
  ]);

  return results.every(Boolean);
}

export async function triggerAuctionEnded(
  auctionId: string,
  data: {
    finalBid: number;
    winnerName?: string;
    endedByBuyNow?: boolean;
  }
): Promise<boolean> {
  return triggerEvent(CHANNELS.AUCTION(auctionId), EVENTS.AUCTION_ENDED, { auctionId, ...data });
}

export async function triggerAuctionCreated(data: {
  id: string;
  title: string;
  startingBid: number;
  endTime: string;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.AUCTIONS, EVENTS.AUCTION_CREATED, data);
}

export async function triggerAuctionUpdated(
  auctionId: string,
  data: Record<string, unknown>
): Promise<boolean> {
  return triggerEvent(CHANNELS.AUCTION(auctionId), EVENTS.AUCTION_UPDATED, { auctionId, ...data });
}

// Inventory events
export async function triggerStockUpdated(data: {
  productId: string;
  productName: string;
  oldStock: number;
  newStock: number;
}): Promise<boolean> {
  const results = await Promise.all([
    triggerEvent(CHANNELS.INVENTORY, EVENTS.STOCK_UPDATED, data),
    data.newStock <= 5 && data.newStock > 0
      ? triggerEvent(CHANNELS.ADMIN, EVENTS.INVENTORY_ALERT, {
          ...data,
          alertType: 'low-stock',
        })
      : Promise.resolve(true),
    data.newStock === 0
      ? triggerEvent(CHANNELS.ADMIN, EVENTS.INVENTORY_ALERT, {
          ...data,
          alertType: 'sold-out',
        })
      : Promise.resolve(true),
  ]);

  return results.every(Boolean);
}

export async function triggerProductSoldOut(data: {
  productId: string;
  productName: string;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.PRODUCT_SOLD_OUT, data);
}

// Order events
export async function triggerOrderCreated(data: {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  itemCount: number;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.ADMIN, EVENTS.NEW_ORDER, data);
}

export async function triggerOrderStatusUpdated(data: {
  orderId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  customerEmail: string;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.ORDERS, EVENTS.ORDER_STATUS_UPDATED, data);
}

// Product events (admin → storefront sync)
export async function triggerProductCreated(data: {
  productId: string;
  productName: string;
  categoryId?: string;
  price: number;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.PRODUCT_CREATED, data);
}

export async function triggerProductUpdated(data: {
  productId: string;
  productName: string;
  changes: Record<string, unknown>;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.PRODUCT_UPDATED, data);
}

export async function triggerProductDeleted(data: {
  productId: string;
  productName: string;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.PRODUCT_DELETED, data);
}

// Category events (admin → storefront sync)
export async function triggerCategoryCreated(data: {
  categoryId: string;
  categoryName: string;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.CATEGORY_CREATED, data);
}

export async function triggerCategoryUpdated(data: {
  categoryId: string;
  categoryName: string;
  changes: Record<string, unknown>;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.CATEGORY_UPDATED, data);
}

export async function triggerCategoryDeleted(data: {
  categoryId: string;
  categoryName: string;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.CATEGORY_DELETED, data);
}

// Site content events (admin → storefront sync)
export async function triggerSiteSettingsUpdated(data: {
  setting: string;
  value: unknown;
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.SITE_SETTINGS_UPDATED, data);
}

export async function triggerFeaturedProductsUpdated(data: {
  productIds: string[];
}): Promise<boolean> {
  return triggerEvent(CHANNELS.INVENTORY, EVENTS.FEATURED_PRODUCTS_UPDATED, data);
}

export async function triggerContentUpdated(data: {
  contentType: string;
  contentId?: string;
  section?: string;
  key?: string;
}): Promise<boolean> {
  const results = await Promise.all([
    triggerEvent(CHANNELS.CONTENT, EVENTS.CONTENT_UPDATED, data),
    data.section === 'hero'
      ? triggerEvent(CHANNELS.CONTENT, EVENTS.HERO_UPDATED, data)
      : Promise.resolve(true),
  ]);
  return results.every(Boolean);
}

// Utility to get Pusher config for client
export function getPusherClientConfig() {
  return {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  };
}

// Auth for private channels (to be used in API route)
export function authenticateChannel(socketId: string, channel: string, userId?: string) {
  const pusher = getPusherServer();
  if (!pusher) {
    throw new Error('Pusher not configured');
  }

  if (channel.startsWith('private-')) {
    if (!userId) {
      throw new Error('User ID required for private channels');
    }
    return pusher.authorizeChannel(socketId, channel);
  }

  if (channel.startsWith('presence-')) {
    if (!userId) {
      throw new Error('User ID required for presence channels');
    }
    return pusher.authorizeChannel(socketId, channel, {
      user_id: userId,
    });
  }

  throw new Error('Invalid channel type for authentication');
}
