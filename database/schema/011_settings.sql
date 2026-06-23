-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 011_settings.sql - Site Settings & Configuration
-- =============================================

-- Site settings (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  type TEXT DEFAULT 'string' CHECK (type IN (
    'string', 'number', 'boolean', 'json', 'array', 'html'
  )),
  category TEXT DEFAULT 'general', -- 'general', 'seo', 'payment', 'shipping', 'email', etc.
  label TEXT, -- Human-readable label
  description TEXT,

  -- Validation
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}', -- { min, max, pattern, etc. }

  -- Access
  is_public BOOLEAN DEFAULT false, -- Can be exposed to frontend

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Discount type
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value DECIMAL(10,2) NOT NULL, -- Percentage (0-100) or fixed amount
  max_discount_amount DECIMAL(10,2), -- Cap for percentage discounts

  -- Conditions
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  minimum_items INTEGER DEFAULT 0,

  -- Product restrictions
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN (
    'all', 'specific_products', 'specific_categories', 'specific_collections'
  )),
  applicable_product_ids UUID[] DEFAULT '{}',
  applicable_category_ids UUID[] DEFAULT '{}',
  excluded_product_ids UUID[] DEFAULT '{}',

  -- Customer restrictions
  customer_type TEXT DEFAULT 'all' CHECK (customer_type IN (
    'all', 'new', 'returning', 'specific'
  )),
  allowed_customer_ids UUID[] DEFAULT '{}',
  allowed_emails TEXT[] DEFAULT '{}',

  -- Usage limits
  usage_limit INTEGER, -- Total uses allowed (null = unlimited)
  usage_limit_per_customer INTEGER DEFAULT 1, -- Per customer
  times_used INTEGER DEFAULT 0,

  -- Validity
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Additional perks
  free_shipping BOOLEAN DEFAULT false,

  -- Auto-apply
  auto_apply BOOLEAN DEFAULT false,
  auto_apply_priority INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount code usage tracking
CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping zones
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  countries TEXT[] DEFAULT '{}', -- ISO country codes
  provinces TEXT[] DEFAULT '{}', -- Province/state codes
  postal_codes TEXT[] DEFAULT '{}', -- Specific postal codes

  -- Default zone fallback
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping methods
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  type TEXT NOT NULL CHECK (type IN (
    'flat_rate', 'free', 'weight_based', 'price_based', 'item_based', 'calculated'
  )),
  base_cost DECIMAL(10,2) DEFAULT 0,

  -- Weight-based pricing
  cost_per_kg DECIMAL(10,2),
  min_weight DECIMAL(10,3),
  max_weight DECIMAL(10,3),

  -- Price-based thresholds
  free_shipping_threshold DECIMAL(10,2), -- Free shipping above this amount

  -- Delivery estimate
  min_delivery_days INTEGER,
  max_delivery_days INTEGER,

  -- Restrictions
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax rates
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rate DECIMAL(5,4) NOT NULL, -- e.g., 0.13 for 13%

  -- Location
  country TEXT DEFAULT 'CA',
  province TEXT, -- NULL means applies to whole country

  -- Type
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'reduced', 'zero', 'exempt')),
  tax_class TEXT DEFAULT 'default', -- For different product types

  -- Compound tax (tax on tax)
  is_compound BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory logs
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Change info
  quantity_change INTEGER NOT NULL, -- Positive or negative
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,

  -- Reason
  reason TEXT NOT NULL CHECK (reason IN (
    'sale', 'return', 'adjustment', 'restock', 'damaged', 'theft', 'count', 'import'
  )),
  notes TEXT,

  -- Related records
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Who made the change

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON discount_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_email ON discount_usage(customer_email);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_default ON shipping_zones(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_shipping_methods_zone ON shipping_methods(zone_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_location ON tax_rates(country, province);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created ON inventory_logs(created_at DESC);

-- Triggers
DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_discount_codes_updated_at ON discount_codes;
CREATE TRIGGER trigger_discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_shipping_zones_updated_at ON shipping_zones;
CREATE TRIGGER trigger_shipping_zones_updated_at
  BEFORE UPDATE ON shipping_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_shipping_methods_updated_at ON shipping_methods;
CREATE TRIGGER trigger_shipping_methods_updated_at
  BEFORE UPDATE ON shipping_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_tax_rates_updated_at ON tax_rates;
CREATE TRIGGER trigger_tax_rates_updated_at
  BEFORE UPDATE ON tax_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
