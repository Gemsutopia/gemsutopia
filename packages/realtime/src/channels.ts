// Channel names
export const CHANNELS = {
  AUCTIONS: 'auctions',
  AUCTION: (id: string) => `auction-${id}`,
  INVENTORY: 'inventory',
  CONTENT: 'content',
  ORDERS: 'private-orders',
  ADMIN: 'private-admin',
  ADMIN_NOTIFICATIONS: 'admin-notifications',
} as const;

// Event names
export const EVENTS = {
  // Auction events
  BID_PLACED: 'bid-placed',
  AUCTION_ENDED: 'auction-ended',
  AUCTION_CREATED: 'auction-created',
  AUCTION_UPDATED: 'auction-updated',
  AUCTION_DELETED: 'auction-deleted',

  // Inventory events
  STOCK_UPDATED: 'stock-updated',
  PRODUCT_SOLD_OUT: 'product-sold-out',
  LOW_STOCK_ALERT: 'low-stock-alert',

  // Product events (admin → storefront sync)
  PRODUCT_CREATED: 'product-created',
  PRODUCT_UPDATED: 'product-updated',
  PRODUCT_DELETED: 'product-deleted',

  // Category events (admin → storefront sync)
  CATEGORY_CREATED: 'category-created',
  CATEGORY_UPDATED: 'category-updated',
  CATEGORY_DELETED: 'category-deleted',

  // Order events
  ORDER_CREATED: 'order-created',
  ORDER_STATUS_UPDATED: 'order-status-updated',
  PAYMENT_RECEIVED: 'payment-received',

  // Site content events (admin → storefront sync)
  SITE_SETTINGS_UPDATED: 'site-settings-updated',
  FEATURED_PRODUCTS_UPDATED: 'featured-products-updated',
  DISCOUNT_CODE_CREATED: 'discount-code-created',
  FAQ_UPDATED: 'faq-updated',
  CONTENT_UPDATED: 'content-updated',
  HERO_UPDATED: 'hero-updated',

  // Stats events (admin → storefront sync)
  STATS_UPDATED: 'stats-updated',
  STATS_CREATED: 'stats-created',
  STATS_DELETED: 'stats-deleted',

  // Admin events
  NEW_ORDER: 'new-order',
  NEW_BID: 'new-bid',
  INVENTORY_ALERT: 'inventory-alert',
  NEW_REVIEW: 'new-review',
} as const;

// Admin channel names
export const ADMIN_CHANNELS = {
  NOTIFICATIONS: 'admin-notifications',
  ORDERS: 'private-admin-orders',
  AUCTIONS: 'private-admin-auctions',
  INVENTORY: 'private-admin-inventory',
} as const;
