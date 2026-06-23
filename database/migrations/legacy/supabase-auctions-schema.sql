-- Auctions table schema for Supabase
-- Run this SQL in your Supabase SQL editor

CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}', -- Array of image URLs
  video_url TEXT, -- Optional video URL
  featured_image_index INTEGER DEFAULT 0,
  
  -- Auction-specific fields
  starting_bid DECIMAL(10,2) NOT NULL CHECK (starting_bid >= 0),
  current_bid DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_bid >= 0),
  reserve_price DECIMAL(10,2) CHECK (reserve_price IS NULL OR reserve_price >= starting_bid),
  bid_count INTEGER DEFAULT 0 CHECK (bid_count >= 0),
  
  -- Timing
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL CHECK (end_time > start_time),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'cancelled')),
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_auctions_created_at ON auctions(created_at DESC);
CREATE INDEX idx_auctions_current_bid ON auctions(current_bid DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_auctions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_auctions_updated_at
  BEFORE UPDATE ON auctions
  FOR EACH ROW
  EXECUTE FUNCTION update_auctions_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to active auctions
CREATE POLICY "Public can read active auctions" ON auctions
  FOR SELECT USING (is_active = true AND status IN ('active', 'ended'));

-- Policy to allow authenticated admin access for all operations
CREATE POLICY "Admin full access to auctions" ON auctions
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: Add comments
COMMENT ON TABLE auctions IS 'Auction items for gemstone sales';
COMMENT ON COLUMN auctions.starting_bid IS 'Initial bid amount in dollars';
COMMENT ON COLUMN auctions.current_bid IS 'Highest current bid in dollars';
COMMENT ON COLUMN auctions.reserve_price IS 'Minimum price for sale (can be null)';
COMMENT ON COLUMN auctions.status IS 'Auction status: pending, active, ended, cancelled';