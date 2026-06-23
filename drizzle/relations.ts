import { relations } from 'drizzle-orm/relations';
import {
  categories,
  products,
  orders,
  payments,
  users,
  auctions,
  orderItems,
  bids,
  auctionWatchers,
  reviews,
  wishlists,
  wishlistItems,
  carts,
  cartItems,
  notifications,
  emailSubscriptions,
  discountCodes,
  discountUsage,
  shippingZones,
  shippingMethods,
  inventoryLogs,
} from './schema';

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  category: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categories_parentId_categories_id',
  }),
  categories: many(categories, {
    relationName: 'categories_parentId_categories_id',
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  auctions: many(auctions),
  orderItems: many(orderItems),
  reviews: many(reviews),
  wishlistItems: many(wishlistItems),
  cartItems: many(cartItems),
  notifications: many(notifications),
  inventoryLogs: many(inventoryLogs),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  payments: many(payments),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
  notifications: many(notifications),
  discountUsages: many(discountUsage),
  inventoryLogs: many(inventoryLogs),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  auctions_highestBidderId: many(auctions, {
    relationName: 'auctions_highestBidderId_users_id',
  }),
  auctions_winnerId: many(auctions, {
    relationName: 'auctions_winnerId_users_id',
  }),
  bids: many(bids),
  auctionWatchers: many(auctionWatchers),
  reviews: many(reviews),
  wishlists: many(wishlists),
  carts: many(carts),
  notifications: many(notifications),
  emailSubscriptions: many(emailSubscriptions),
  discountUsages: many(discountUsage),
  inventoryLogs: many(inventoryLogs),
}));

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  user_highestBidderId: one(users, {
    fields: [auctions.highestBidderId],
    references: [users.id],
    relationName: 'auctions_highestBidderId_users_id',
  }),
  user_winnerId: one(users, {
    fields: [auctions.winnerId],
    references: [users.id],
    relationName: 'auctions_winnerId_users_id',
  }),
  product: one(products, {
    fields: [auctions.productId],
    references: [products.id],
  }),
  bids: many(bids),
  auctionWatchers: many(auctionWatchers),
  notifications: many(notifications),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  auction: one(auctions, {
    fields: [bids.auctionId],
    references: [auctions.id],
  }),
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
}));

export const auctionWatchersRelations = relations(auctionWatchers, ({ one }) => ({
  auction: one(auctions, {
    fields: [auctionWatchers.auctionId],
    references: [auctions.id],
  }),
  user: one(users, {
    fields: [auctionWatchers.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  wishlistItems: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [notifications.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [notifications.productId],
    references: [products.id],
  }),
  auction: one(auctions, {
    fields: [notifications.auctionId],
    references: [auctions.id],
  }),
}));

export const emailSubscriptionsRelations = relations(emailSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [emailSubscriptions.userId],
    references: [users.id],
  }),
}));

export const discountUsageRelations = relations(discountUsage, ({ one }) => ({
  discountCode: one(discountCodes, {
    fields: [discountUsage.discountCodeId],
    references: [discountCodes.id],
  }),
  order: one(orders, {
    fields: [discountUsage.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [discountUsage.userId],
    references: [users.id],
  }),
}));

export const discountCodesRelations = relations(discountCodes, ({ many }) => ({
  discountUsages: many(discountUsage),
}));

export const shippingMethodsRelations = relations(shippingMethods, ({ one }) => ({
  shippingZone: one(shippingZones, {
    fields: [shippingMethods.zoneId],
    references: [shippingZones.id],
  }),
}));

export const shippingZonesRelations = relations(shippingZones, ({ many }) => ({
  shippingMethods: many(shippingMethods),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLogs.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [inventoryLogs.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [inventoryLogs.userId],
    references: [users.id],
  }),
}));
