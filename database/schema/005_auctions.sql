-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 005_auctions.sql - Auctions and Bids
-- =============================================

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,

  -- Media
  images TEXT[] DEFAULT '{}',
  featured_image_index INTEGER DEFAULT 0,
  video_url TEXT,

  -- Auction pricing
  starting_bid DECIMAL(10,2) NOT NULL CHECK (starting_bid >= 0),
  current_bid DECIMAL(10,2) DEFAULT 0 CHECK (current_bid >= 0),
  reserve_price DECIMAL(10,2) CHECK (reserve_price IS NULL OR reserve_price >= starting_bid),
  buy_now_price DECIMAL(10,2) CHECK (buy_now_price IS NULL OR buy_now_price > starting_bid),
  bid_increment DECIMAL(10,2) DEFAULT 1.00 CHECK (bid_increment > 0),
  currency TEXT DEFAULT 'CAD',

  -- Bidding stats
  bid_count INTEGER DEFAULT 0 CHECK (bid_count >= 0),
  highest_bidder_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timing
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL CHECK (end_time > start_time),
  extended_end_time TIMESTAMP WITH TIME ZONE, -- For anti-sniping

  -- Anti-sniping settings
  auto_extend BOOLEAN DEFAULT true,
  extend_minutes INTEGER DEFAULT 5, -- Extend auction by X minutes if bid in last Y minutes
  extend_threshold_minutes INTEGER DEFAULT 5,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'scheduled', 'active', 'ended', 'sold', 'cancelled', 'no_sale'
  )),
  is_active BOOLEAN DEFAULT true,

  -- Winner info
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  winning_bid DECIMAL(10,2),
  won_at TIMESTAMP WITH TIME ZONE,

  -- Product link (optional - if auction is for existing product)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Gemstone attributes (if not linked to product)
  gemstone_type TEXT,
  carat_weight DECIMAL(6,3),
  cut TEXT,
  clarity TEXT,
  color TEXT,
  origin TEXT,
  certification TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Bidder info (for anonymous/guest bidding)
  bidder_email TEXT NOT NULL,
  bidder_name TEXT,

  -- Bid details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  max_bid DECIMAL(10,2), -- For auto-bidding
  is_auto_bid BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'outbid', 'winning', 'won', 'cancelled', 'retracted'
  )),
  is_winning BOOLEAN DEFAULT false,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction watchers (users watching an auction)
CREATE TABLE IF NOT EXISTS auction_watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  notify_outbid BOOLEAN DEFAULT true,
  notify_ending BOOLEAN DEFAULT true,
  notify_result BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auction_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auctions_slug ON auctions(slug);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_active ON auctions(is_active, status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_start_time ON auctions(start_time);
CREATE INDEX IF NOT EXISTS idx_auctions_current_bid ON auctions(current_bid DESC);
CREATE INDEX IF NOT EXISTS idx_auctions_created ON auctions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auctions_product ON auctions(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(auction_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_created ON bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auction_watchers_auction ON auction_watchers(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_watchers_user ON auction_watchers(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_auctions_updated_at ON auctions;
CREATE TRIGGER trigger_auctions_updated_at
  BEFORE UPDATE ON auctions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate slug
DROP TRIGGER IF EXISTS trigger_auction_slug ON auctions;
CREATE TRIGGER trigger_auction_slug
  BEFORE INSERT ON auctions
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_slug(); -- Reuse product slug function

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_auctions_search ON auctions
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
