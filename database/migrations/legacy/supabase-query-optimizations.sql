-- SUPABASE QUERY OPTIMIZATIONS
-- These replace common slow queries with optimized versions

-- 1. Optimize "get active auctions" query
-- Instead of: SELECT * FROM auctions WHERE status = 'active'
-- Use this optimized view:
CREATE OR REPLACE VIEW active_auctions AS
SELECT
    id, title, description, images, current_bid, starting_bid,
    reserve_price, bid_count, start_time, end_time, status, is_active,
    featured_image_index, video_url, metadata, created_at
FROM auctions
WHERE status = 'active'
    AND is_active = true
    AND end_time > NOW()
ORDER BY end_time ASC;

-- 2. Optimize "get products by category" query
CREATE OR REPLACE VIEW products_by_category AS
SELECT
    p.id, p.name, p.price, p.sale_price, p.on_sale, p.images,
    p.inventory, p.featured_image_index, p.category_id,
    c.name as category_name, c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
    AND c.is_active = true
    AND p.inventory > 0;

-- 3. Optimize "ending soon auctions" query
CREATE OR REPLACE VIEW ending_soon_auctions AS
SELECT
    id, title, current_bid, end_time,
    EXTRACT(EPOCH FROM (end_time - NOW())) / 3600 as hours_left
FROM auctions
WHERE status = 'active'
    AND is_active = true
    AND end_time > NOW()
    AND end_time < NOW() + INTERVAL '24 hours'
ORDER BY end_time ASC;

-- 4. Optimize "featured products" query
CREATE OR REPLACE VIEW featured_products AS
SELECT
    id, name, price, sale_price, on_sale, images,
    featured_image_index, inventory
FROM products
WHERE featured = true
    AND is_active = true
    AND inventory > 0
ORDER BY sort_order ASC, created_at DESC;

-- 5. Create materialized view for expensive aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS auction_stats AS
SELECT
    COUNT(*) as total_auctions,
    COUNT(*) FILTER (WHERE status = 'active') as active_auctions,
    AVG(current_bid) as avg_bid,
    MAX(current_bid) as highest_bid,
    SUM(bid_count) as total_bids
FROM auctions
WHERE created_at > NOW() - INTERVAL '30 days';

-- Refresh this materialized view periodically
-- You can set up a cron job or call this manually
-- REFRESH MATERIALIZED VIEW auction_stats;

-- 6. Optimize search queries with proper indexing
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    price NUMERIC,
    images TEXT[],
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.price,
        p.images,
        ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', search_term)) as rank
    FROM products p
    WHERE p.is_active = true
        AND p.inventory > 0
        AND (
            to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_term)
        )
    ORDER BY rank DESC, p.featured DESC, p.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- 7. Optimize auction bidding query
CREATE OR REPLACE FUNCTION place_bid(
    auction_id UUID,
    bid_amount NUMERIC
) RETURNS JSON AS $$
DECLARE
    auction_record auctions%ROWTYPE;
    result JSON;
BEGIN
    -- Get and lock the auction row
    SELECT * INTO auction_record
    FROM auctions
    WHERE id = auction_id
    FOR UPDATE;

    -- Validate bid
    IF auction_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Auction not found');
    END IF;

    IF auction_record.status != 'active' OR NOT auction_record.is_active THEN
        RETURN json_build_object('success', false, 'message', 'Auction not active');
    END IF;

    IF bid_amount <= auction_record.current_bid THEN
        RETURN json_build_object('success', false, 'message', 'Bid must be higher than current bid');
    END IF;

    -- Update auction
    UPDATE auctions
    SET
        current_bid = bid_amount,
        bid_count = bid_count + 1,
        updated_at = NOW()
    WHERE id = auction_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Bid placed successfully',
        'new_bid', bid_amount,
        'bid_count', auction_record.bid_count + 1
    );
END;
$$ LANGUAGE plpgsql;