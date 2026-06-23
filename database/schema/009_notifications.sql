-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 009_notifications.sql - User Notifications
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- For guest notifications
  email TEXT,

  -- Notification content
  type TEXT NOT NULL CHECK (type IN (
    'order_confirmation', 'order_shipped', 'order_delivered',
    'bid_placed', 'outbid', 'auction_won', 'auction_lost', 'auction_ending',
    'price_drop', 'back_in_stock', 'wishlist_sale',
    'review_approved', 'review_response',
    'welcome', 'password_reset', 'account_update',
    'promo', 'newsletter', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_text TEXT,

  -- Related entities
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email subscriptions
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Subscription preferences
  newsletter BOOLEAN DEFAULT true,
  promotions BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  auction_updates BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT true,
  stock_alerts BOOLEAN DEFAULT true,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Unsubscribe
  unsubscribe_token TEXT UNIQUE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,

  -- Source
  source TEXT DEFAULT 'website', -- 'website', 'checkout', 'popup', 'import'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_email ON notifications(email);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_subs_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subs_user ON email_subscriptions(user_id);

-- Triggers
DROP TRIGGER IF EXISTS trigger_email_subs_updated_at ON email_subscriptions;
CREATE TRIGGER trigger_email_subs_updated_at
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate unsubscribe token
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token = encode(gen_random_bytes(32), 'hex');
  END IF;
  IF NEW.verification_token IS NULL AND NOT NEW.is_verified THEN
    NEW.verification_token = encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_email_sub_tokens ON email_subscriptions;
CREATE TRIGGER trigger_email_sub_tokens
  BEFORE INSERT ON email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION generate_unsubscribe_token();
