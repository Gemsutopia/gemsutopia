-- SUPABASE QUERY OPTIMIZATIONS (SAFE VERSION)
-- Run these in your Supabase SQL Editor

-- 1. Create performance indexes (safe - only if columns exist)
DO $$
BEGIN
    -- Basic performance indexes for existing columns
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'auctions' AND column_name = 'status') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status_active
        ON auctions (status, is_active, end_time)
        WHERE status = 'active' AND is_active = true;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'inventory') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_inventory
        ON products (inventory)
        WHERE inventory > 0;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'featured') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured
        ON products (featured, is_active)
        WHERE featured = true AND is_active = true;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'auctions' AND column_name = 'current_bid') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_current_bid
        ON auctions (current_bid DESC);
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price
        ON products (price);
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_sort_order
        ON categories (sort_order, is_active)
        WHERE is_active = true;
    END IF;
END $$;

-- 2. Optimize auction queries with a safe view
CREATE OR REPLACE VIEW active_auctions AS
SELECT
    id, title, description, images, current_bid, starting_bid,
    reserve_price, bid_count, start_time, end_time, status, is_active,
    CASE WHEN EXTRACT(EPOCH FROM (end_time - NOW())) / 3600 <= 24
         THEN true ELSE false END as ending_soon
FROM auctions
WHERE status = 'active'
    AND is_active = true
    AND end_time > NOW()
ORDER BY end_time ASC;

-- 3. Optimize products view
CREATE OR REPLACE VIEW active_products AS
SELECT
    id, name, price, images, inventory, is_active,
    CASE WHEN inventory > 0 THEN true ELSE false END as in_stock
FROM products
WHERE is_active = true
ORDER BY
    CASE WHEN inventory > 0 THEN 0 ELSE 1 END, -- In stock first
    created_at DESC;

-- 4. Create a safe bidding function
CREATE OR REPLACE FUNCTION safe_place_bid(
    auction_id UUID,
    bid_amount NUMERIC
) RETURNS JSON AS $$
DECLARE
    auction_record RECORD;
    result JSON;
BEGIN
    -- Get auction details
    SELECT * INTO auction_record
    FROM auctions
    WHERE id = auction_id;

    -- Basic validation
    IF auction_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Auction not found');
    END IF;

    IF auction_record.status != 'active' OR NOT auction_record.is_active THEN
        RETURN json_build_object('success', false, 'message', 'Auction not active');
    END IF;

    IF bid_amount <= auction_record.current_bid THEN
        RETURN json_build_object('success', false, 'message', 'Bid must be higher than current bid');
    END IF;

    -- Update auction (this will trigger real-time updates)
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

-- 5. Add search capability (safe)
CREATE OR REPLACE FUNCTION search_auctions(search_term TEXT DEFAULT '')
RETURNS TABLE (
    id UUID,
    title TEXT,
    current_bid NUMERIC,
    end_time TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    IF search_term = '' OR search_term IS NULL THEN
        RETURN QUERY
        SELECT a.id, a.title, a.current_bid, a.end_time, 1.0::REAL as rank
        FROM auctions a
        WHERE a.status = 'active' AND a.is_active = true
        ORDER BY a.end_time ASC
        LIMIT 20;
    ELSE
        RETURN QUERY
        SELECT
            a.id,
            a.title,
            a.current_bid,
            a.end_time,
            CASE
                WHEN a.title ILIKE '%' || search_term || '%' THEN 1.0
                WHEN a.description ILIKE '%' || search_term || '%' THEN 0.5
                ELSE 0.1
            END::REAL as rank
        FROM auctions a
        WHERE a.status = 'active'
            AND a.is_active = true
            AND (
                a.title ILIKE '%' || search_term || '%'
                OR a.description ILIKE '%' || search_term || '%'
            )
        ORDER BY rank DESC, a.end_time ASC
        LIMIT 20;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Update table statistics for better performance
ANALYZE auctions;
ANALYZE products;
ANALYZE categories;

-- 7. Add helpful constraints (safe)
DO $$
BEGIN
    -- Add constraints only if columns exist and constraints don't already exist
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'auctions' AND column_name = 'current_bid') THEN
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'check_auction_bid_positive') THEN
            ALTER TABLE auctions ADD CONSTRAINT check_auction_bid_positive
            CHECK (current_bid >= 0 AND starting_bid >= 0);
        END IF;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'check_product_price_positive') THEN
            ALTER TABLE products ADD CONSTRAINT check_product_price_positive
            CHECK (price >= 0);
        END IF;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'inventory') THEN
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'check_inventory_non_negative') THEN
            ALTER TABLE products ADD CONSTRAINT check_inventory_non_negative
            CHECK (inventory >= 0);
        END IF;
    END IF;
END $$;