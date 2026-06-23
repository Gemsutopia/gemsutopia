-- SUPABASE PERFORMANCE FIXES
-- Run these in your Supabase SQL Editor

-- 1. Add missing indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status_active
ON auctions (status, is_active, end_time)
WHERE status = 'active' AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_inventory
ON products (inventory)
WHERE inventory > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured
ON products (featured, is_active)
WHERE featured = true AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_current_bid
ON auctions (current_bid DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price
ON products (price);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_sort_order
ON categories (sort_order, is_active)
WHERE is_active = true;

-- 2. Add composite indexes for common filter combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active
ON products (category_id, is_active, inventory)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_time_range
ON auctions (start_time, end_time, status)
WHERE status = 'active';

-- 3. Optimize text search (if you have search functionality)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_search
ON products USING gin(to_tsvector('english', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_title_search
ON auctions USING gin(to_tsvector('english', title));

-- 4. Add partial indexes for common filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_on_sale
ON products (sale_price, price)
WHERE on_sale = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_ending_soon
ON auctions (end_time)
WHERE status = 'active' AND end_time > NOW() AND end_time < NOW() + INTERVAL '24 hours';

-- 5. Statistics and maintenance
-- Update table statistics for better query planning
ANALYZE auctions;
ANALYZE products;
ANALYZE categories;
ANALYZE orders;

-- 6. Clean up unused data (be careful with this!)
-- Delete old ended auctions (older than 6 months)
-- DELETE FROM auctions WHERE status = 'ended' AND end_time < NOW() - INTERVAL '6 months';

-- 7. Optimize JSON columns (if you use metadata)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_metadata_gin
ON products USING gin(metadata)
WHERE metadata IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_metadata_gin
ON auctions USING gin(metadata)
WHERE metadata IS NOT NULL;

-- 8. Add constraints for data integrity (improves performance)
ALTER TABLE auctions ADD CONSTRAINT check_bid_positive
CHECK (current_bid >= 0 AND starting_bid >= 0);

ALTER TABLE products ADD CONSTRAINT check_price_positive
CHECK (price >= 0);

ALTER TABLE products ADD CONSTRAINT check_inventory_non_negative
CHECK (inventory >= 0);

-- 9. Vacuum and reindex (maintenance)
-- Run these occasionally for maintenance
-- VACUUM ANALYZE auctions;
-- VACUUM ANALYZE products;
-- REINDEX TABLE auctions;
-- REINDEX TABLE products;