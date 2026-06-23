-- =============================================
-- GEMSUTOPIA DATABASE - PERFORMANCE INDEXES
-- Migration 002 - Add indexes for common queries
-- =============================================

-- Products indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_active_inventory ON products(is_active, inventory) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_on_sale ON products(on_sale) WHERE on_sale = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_gemstone_type ON products(gemstone_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price);

-- Orders indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Order items indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Auctions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_is_active ON auctions(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_active_ending ON auctions(end_time) WHERE is_active = true AND status = 'active';

-- Bids indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_bidder_email ON bids(bidder_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

-- Users indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);

-- Reviews indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved) WHERE is_approved = true;

-- Wishlists indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Cart items indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

-- Payments indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);

-- Categories indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Inventory logs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at DESC);

-- Full-text search index for products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search ON products
  USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(gemstone_type, '')));

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_category ON products(category_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
