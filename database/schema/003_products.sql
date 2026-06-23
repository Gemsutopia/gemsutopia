-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 003_products.sql - Products Table
-- =============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  sale_price DECIMAL(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
  on_sale BOOLEAN DEFAULT false,
  cost_price DECIMAL(10,2), -- For profit calculation

  -- Inventory
  inventory INTEGER DEFAULT 0 CHECK (inventory >= 0),
  sku TEXT UNIQUE,
  track_inventory BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,

  -- Media
  images TEXT[] DEFAULT '{}',
  featured_image_index INTEGER DEFAULT 0,
  video_url TEXT,

  -- Classification
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Gemstone-specific attributes
  gemstone_type TEXT, -- e.g., 'Ruby', 'Sapphire', 'Emerald'
  carat_weight DECIMAL(6,3),
  cut TEXT, -- e.g., 'Excellent', 'Very Good', 'Good'
  clarity TEXT, -- e.g., 'VVS1', 'VS2', 'SI1'
  color TEXT, -- e.g., 'D', 'E', 'F' for diamonds
  origin TEXT, -- e.g., 'Myanmar', 'Colombia', 'Sri Lanka'
  treatment TEXT, -- e.g., 'None', 'Heat Treated', 'Enhanced'
  certification TEXT, -- e.g., 'GIA', 'AGS', 'IGI'
  certification_number TEXT,

  -- Physical attributes
  dimensions JSONB, -- { length, width, height, unit }
  weight DECIMAL(10,3), -- in grams
  shape TEXT, -- e.g., 'Round', 'Oval', 'Cushion', 'Princess'

  -- Display options
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Stats
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Additional data
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured, is_active) WHERE featured = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_inventory ON products(inventory) WHERE inventory > 0;
CREATE INDEX IF NOT EXISTS idx_products_gemstone_type ON products(gemstone_type) WHERE gemstone_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sale ON products(on_sale, sale_price) WHERE on_sale = true;
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order, created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products
  USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(gemstone_type, '')));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate slug from name if not provided
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug = trim(both '-' from NEW.slug);
    -- Add random suffix to ensure uniqueness
    NEW.slug = NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_slug ON products;
CREATE TRIGGER trigger_product_slug
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_slug();
