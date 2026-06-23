-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 013_views.sql - Database Views
-- =============================================

-- Active auctions view
CREATE OR REPLACE VIEW active_auctions AS
SELECT
  a.id,
  a.title,
  a.slug,
  a.description,
  a.images,
  a.featured_image_index,
  a.starting_bid,
  a.current_bid,
  a.reserve_price,
  a.buy_now_price,
  a.bid_count,
  a.start_time,
  COALESCE(a.extended_end_time, a.end_time) as end_time,
  a.status,
  a.gemstone_type,
  a.carat_weight,
  a.created_at,
  EXTRACT(EPOCH FROM (COALESCE(a.extended_end_time, a.end_time) - NOW())) as seconds_remaining,
  CASE
    WHEN EXTRACT(EPOCH FROM (COALESCE(a.extended_end_time, a.end_time) - NOW())) / 3600 <= 24
    THEN true
    ELSE false
  END as ending_soon
FROM auctions a
WHERE a.status = 'active'
  AND a.is_active = true
  AND COALESCE(a.extended_end_time, a.end_time) > NOW()
ORDER BY a.end_time ASC;

-- Active products view
CREATE OR REPLACE VIEW active_products AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.price,
  p.sale_price,
  p.on_sale,
  p.images,
  p.featured_image_index,
  p.inventory,
  p.category_id,
  c.name as category_name,
  c.slug as category_slug,
  p.gemstone_type,
  p.featured,
  p.is_new,
  p.is_bestseller,
  p.average_rating,
  p.review_count,
  p.created_at,
  CASE WHEN p.inventory > 0 THEN true ELSE false END as in_stock,
  CASE WHEN p.inventory > 0 AND p.inventory <= p.low_stock_threshold THEN true ELSE false END as low_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY
  CASE WHEN p.inventory > 0 THEN 0 ELSE 1 END,
  p.featured DESC,
  p.created_at DESC;

-- Featured products view
CREATE OR REPLACE VIEW featured_products AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.price,
  p.sale_price,
  p.on_sale,
  p.images,
  p.featured_image_index,
  p.inventory,
  p.gemstone_type,
  p.average_rating,
  p.review_count
FROM products p
WHERE p.featured = true
  AND p.is_active = true
  AND p.inventory > 0
ORDER BY p.sort_order ASC, p.created_at DESC
LIMIT 12;

-- Recent orders view
CREATE OR REPLACE VIEW recent_orders AS
SELECT
  o.id,
  o.order_number,
  o.customer_email,
  o.customer_name,
  o.total,
  o.currency,
  o.status,
  o.payment_status,
  o.payment_method,
  o.item_count,
  o.created_at
FROM orders o
ORDER BY o.created_at DESC
LIMIT 50;

-- Low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.inventory,
  p.low_stock_threshold,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
  AND p.track_inventory = true
  AND p.inventory > 0
  AND p.inventory <= p.low_stock_threshold
ORDER BY p.inventory ASC;

-- Category product counts view
CREATE OR REPLACE VIEW category_product_counts AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.image,
  c.sort_order,
  COUNT(p.id) FILTER (WHERE p.is_active = true) as product_count,
  COUNT(p.id) FILTER (WHERE p.is_active = true AND p.inventory > 0) as in_stock_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug, c.image, c.sort_order
ORDER BY c.sort_order ASC, c.name ASC;

-- Auction stats view
CREATE OR REPLACE VIEW auction_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active' AND is_active = true) as active_count,
  COUNT(*) FILTER (WHERE status = 'ended') as ended_count,
  COUNT(*) FILTER (WHERE status = 'sold') as sold_count,
  COALESCE(AVG(current_bid) FILTER (WHERE status = 'active'), 0) as avg_current_bid,
  COALESCE(MAX(current_bid) FILTER (WHERE status = 'active'), 0) as max_current_bid,
  COALESCE(SUM(bid_count) FILTER (WHERE status = 'active'), 0) as total_active_bids
FROM auctions;

-- User order history view
CREATE OR REPLACE VIEW user_order_history AS
SELECT
  o.id,
  o.order_number,
  o.user_id,
  o.customer_email,
  o.total,
  o.status,
  o.payment_status,
  o.items,
  o.item_count,
  o.tracking_number,
  o.shipped_at,
  o.delivered_at,
  o.created_at
FROM orders o
WHERE o.user_id IS NOT NULL
ORDER BY o.created_at DESC;
