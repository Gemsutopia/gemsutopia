-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 007_wishlists.sql - User Wishlists
-- =============================================

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- For guest wishlists (stored by email or session)
  guest_email TEXT,
  session_id TEXT,

  -- Wishlist info
  name TEXT DEFAULT 'My Wishlist',
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE, -- For sharing private wishlists

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Additional info
  notes TEXT,
  priority INTEGER DEFAULT 0, -- For sorting
  added_price DECIMAL(10,2), -- Price when added (for price drop alerts)

  -- Notifications
  notify_price_drop BOOLEAN DEFAULT true,
  notify_back_in_stock BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(wishlist_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_guest ON wishlists(guest_email);
CREATE INDEX IF NOT EXISTS idx_wishlists_session ON wishlists(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share ON wishlists(share_token);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items(product_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_wishlists_updated_at ON wishlists;
CREATE TRIGGER trigger_wishlists_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate share token
CREATE OR REPLACE FUNCTION generate_wishlist_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL THEN
    NEW.share_token = encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wishlist_share_token ON wishlists;
CREATE TRIGGER trigger_wishlist_share_token
  BEFORE INSERT ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION generate_wishlist_share_token();
