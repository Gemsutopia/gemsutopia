-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 008_cart.sql - Shopping Cart (Gem Pouch)
-- =============================================

-- Shopping carts
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- For guest carts
  session_id TEXT,
  guest_email TEXT,

  -- Cart state
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'abandoned', 'converted', 'merged'
  )),

  -- Totals (cached for performance)
  item_count INTEGER DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,

  -- Applied discount
  discount_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',

  -- Unique constraint for user/session
  CONSTRAINT unique_user_cart UNIQUE NULLS NOT DISTINCT (user_id),
  CONSTRAINT unique_session_cart UNIQUE NULLS NOT DISTINCT (session_id)
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

  -- Price at time of adding (for price lock)
  unit_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),

  -- Product snapshot
  product_snapshot JSONB DEFAULT '{}', -- Name, image, etc.

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(cart_id, product_id)
);

-- Abandoned cart recovery
CREATE TABLE IF NOT EXISTS abandoned_cart_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('reminder_1', 'reminder_2', 'final')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);
CREATE INDEX IF NOT EXISTS idx_carts_expires ON carts(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_emails_cart ON abandoned_cart_emails(cart_id);

-- Triggers
DROP TRIGGER IF EXISTS trigger_carts_updated_at ON carts;
CREATE TRIGGER trigger_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_cart_items_updated_at ON cart_items;
CREATE TRIGGER trigger_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update cart totals
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE carts
  SET
    item_count = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM cart_items
      WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ),
    subtotal = (
      SELECT COALESCE(SUM(quantity * COALESCE(sale_price, unit_price)), 0)
      FROM cart_items
      WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cart_totals ON cart_items;
CREATE TRIGGER trigger_update_cart_totals
  AFTER INSERT OR UPDATE OR DELETE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_totals();
