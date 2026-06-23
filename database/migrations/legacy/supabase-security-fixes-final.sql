-- SUPABASE SECURITY FIXES (FINAL - SAFE VERSION)
-- Run these in your Supabase SQL Editor (Database > SQL Editor)

-- 1. Enable Row Level Security (RLS) on existing tables only
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Check if orders table exists, if not skip it
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Create security policies for public read access (auctions, products, categories)
-- These tables need public read access for your website

-- Auctions: Public can read active auctions
CREATE POLICY "Allow public read access to active auctions" ON auctions
    FOR SELECT
    USING (is_active = true AND status = 'active');

-- Products: Public can read active products
CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT
    USING (is_active = true);

-- Categories: Public can read active categories
CREATE POLICY "Allow public read access to active categories" ON categories
    FOR SELECT
    USING (is_active = true);

-- 3. Restrict write access to authenticated users only
-- Auctions: Only authenticated users can bid (update current_bid)
CREATE POLICY "Allow authenticated users to bid on auctions" ON auctions
    FOR UPDATE
    TO authenticated
    USING (is_active = true AND status = 'active')
    WITH CHECK (is_active = true AND status = 'active');

-- 4. Admin-only access for creating/deleting
-- Only service role can create/delete auctions
CREATE POLICY "Only admins can create auctions" ON auctions
    FOR INSERT
    TO service_role;

CREATE POLICY "Only admins can delete auctions" ON auctions
    FOR DELETE
    TO service_role;

-- Same for products
CREATE POLICY "Only admins can create products" ON products
    FOR INSERT
    TO service_role;

CREATE POLICY "Only admins can delete products" ON products
    FOR DELETE
    TO service_role;

CREATE POLICY "Only admins can update products" ON products
    FOR UPDATE
    TO service_role;

-- 5. Create indexes for performance (only on columns that exist)
CREATE INDEX IF NOT EXISTS idx_auctions_active ON auctions (is_active, status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions (end_time);

-- Only create category index if the column exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
    END IF;
END $$;

-- 6. Add updated_at triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that need automatic updated_at (only if updated_at column exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'auctions' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_auctions_updated_at ON auctions;
        CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;