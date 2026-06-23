-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 012_functions.sql - Database Functions
-- =============================================

-- Increment inventory (for restocking)
CREATE OR REPLACE FUNCTION increment_inventory(
  product_id UUID,
  increment_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_inventory INTEGER;
BEGIN
  UPDATE products
  SET inventory = inventory + increment_amount,
      updated_at = NOW()
  WHERE id = product_id
  RETURNING inventory INTO new_inventory;

  -- Log the change
  INSERT INTO inventory_logs (product_id, quantity_change, previous_quantity, new_quantity, reason)
  VALUES (product_id, increment_amount, new_inventory - increment_amount, new_inventory, 'restock');

  RETURN new_inventory;
END;
$$ LANGUAGE plpgsql;

-- Decrement inventory (for sales)
CREATE OR REPLACE FUNCTION decrement_inventory(
  p_product_id UUID,
  decrement_amount INTEGER,
  p_order_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_inventory INTEGER;
  old_inventory INTEGER;
BEGIN
  -- Get current inventory
  SELECT inventory INTO old_inventory
  FROM products WHERE id = p_product_id;

  -- Check if sufficient inventory
  IF old_inventory < decrement_amount THEN
    RAISE EXCEPTION 'Insufficient inventory for product %', p_product_id;
  END IF;

  -- Update inventory
  UPDATE products
  SET inventory = inventory - decrement_amount,
      updated_at = NOW()
  WHERE id = p_product_id
  RETURNING inventory INTO new_inventory;

  -- Log the change
  INSERT INTO inventory_logs (product_id, quantity_change, previous_quantity, new_quantity, reason, order_id)
  VALUES (p_product_id, -decrement_amount, old_inventory, new_inventory, 'sale', p_order_id);

  RETURN new_inventory;
END;
$$ LANGUAGE plpgsql;

-- Place a bid on an auction
CREATE OR REPLACE FUNCTION place_bid(
  p_auction_id UUID,
  p_user_id UUID,
  p_bidder_email TEXT,
  p_bidder_name TEXT,
  p_bid_amount NUMERIC,
  p_max_bid NUMERIC DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  auction_record RECORD;
  new_bid_id UUID;
  result JSON;
BEGIN
  -- Lock and get auction details
  SELECT * INTO auction_record
  FROM auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  -- Validate auction exists
  IF auction_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Auction not found');
  END IF;

  -- Validate auction is active
  IF auction_record.status != 'active' OR NOT auction_record.is_active THEN
    RETURN json_build_object('success', false, 'message', 'Auction is not active');
  END IF;

  -- Validate auction hasn't ended
  IF auction_record.end_time < NOW() THEN
    RETURN json_build_object('success', false, 'message', 'Auction has ended');
  END IF;

  -- Validate bid amount
  IF p_bid_amount <= auction_record.current_bid THEN
    RETURN json_build_object('success', false, 'message', 'Bid must be higher than current bid of ' || auction_record.current_bid);
  END IF;

  -- Validate minimum bid increment
  IF p_bid_amount < auction_record.current_bid + auction_record.bid_increment THEN
    RETURN json_build_object('success', false, 'message', 'Minimum bid increment is ' || auction_record.bid_increment);
  END IF;

  -- Mark previous bids as outbid
  UPDATE bids
  SET status = 'outbid', is_winning = false
  WHERE auction_id = p_auction_id AND status IN ('active', 'winning');

  -- Create the bid
  INSERT INTO bids (auction_id, user_id, bidder_email, bidder_name, amount, max_bid, status, is_winning)
  VALUES (p_auction_id, p_user_id, p_bidder_email, p_bidder_name, p_bid_amount, p_max_bid, 'winning', true)
  RETURNING id INTO new_bid_id;

  -- Update auction
  UPDATE auctions
  SET
    current_bid = p_bid_amount,
    bid_count = bid_count + 1,
    highest_bidder_id = p_user_id,
    updated_at = NOW(),
    -- Anti-sniping: extend if bid is in last X minutes
    extended_end_time = CASE
      WHEN auto_extend AND (COALESCE(extended_end_time, end_time) - NOW()) < (extend_threshold_minutes * INTERVAL '1 minute')
      THEN COALESCE(extended_end_time, end_time) + (extend_minutes * INTERVAL '1 minute')
      ELSE extended_end_time
    END
  WHERE id = p_auction_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Bid placed successfully',
    'bid_id', new_bid_id,
    'new_current_bid', p_bid_amount,
    'bid_count', auction_record.bid_count + 1
  );
END;
$$ LANGUAGE plpgsql;

-- Search products
CREATE OR REPLACE FUNCTION search_products(
  search_term TEXT,
  p_category_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_gemstone_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  sale_price NUMERIC,
  on_sale BOOLEAN,
  images TEXT[],
  inventory INTEGER,
  category_id UUID,
  gemstone_type TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    p.sale_price,
    p.on_sale,
    p.images,
    p.inventory,
    p.category_id,
    p.gemstone_type,
    ts_rank(
      to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.gemstone_type, '')),
      plainto_tsquery('english', search_term)
    ) as rank
  FROM products p
  WHERE p.is_active = true
    AND p.inventory > 0
    AND (
      search_term IS NULL
      OR search_term = ''
      OR to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.gemstone_type, ''))
         @@ plainto_tsquery('english', search_term)
      OR p.name ILIKE '%' || search_term || '%'
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_min_price IS NULL OR COALESCE(p.sale_price, p.price) >= p_min_price)
    AND (p_max_price IS NULL OR COALESCE(p.sale_price, p.price) <= p_max_price)
    AND (p_gemstone_type IS NULL OR p.gemstone_type = p_gemstone_type)
  ORDER BY rank DESC, p.featured DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM products WHERE is_active = true),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'total_revenue', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid'),
    'active_auctions', (SELECT COUNT(*) FROM auctions WHERE status = 'active' AND is_active = true),
    'total_customers', (SELECT COUNT(*) FROM users WHERE role = 'customer'),
    'low_stock_products', (SELECT COUNT(*) FROM products WHERE is_active = true AND inventory > 0 AND inventory <= low_stock_threshold),
    'out_of_stock_products', (SELECT COUNT(*) FROM products WHERE is_active = true AND inventory = 0)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Validate discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_customer_email TEXT,
  p_order_total NUMERIC,
  p_item_count INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
  discount_record RECORD;
  usage_count INTEGER;
  result JSON;
BEGIN
  -- Get discount code
  SELECT * INTO discount_record
  FROM discount_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW());

  IF discount_record.id IS NULL THEN
    RETURN json_build_object('valid', false, 'message', 'Invalid or expired discount code');
  END IF;

  -- Check minimum order amount
  IF p_order_total < discount_record.minimum_order_amount THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Minimum order amount of $' || discount_record.minimum_order_amount || ' required'
    );
  END IF;

  -- Check minimum items
  IF p_item_count < discount_record.minimum_items THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Minimum ' || discount_record.minimum_items || ' items required'
    );
  END IF;

  -- Check total usage limit
  IF discount_record.usage_limit IS NOT NULL AND discount_record.times_used >= discount_record.usage_limit THEN
    RETURN json_build_object('valid', false, 'message', 'Discount code has reached its usage limit');
  END IF;

  -- Check per-customer usage
  SELECT COUNT(*) INTO usage_count
  FROM discount_usage
  WHERE discount_code_id = discount_record.id
    AND customer_email = p_customer_email;

  IF usage_count >= discount_record.usage_limit_per_customer THEN
    RETURN json_build_object('valid', false, 'message', 'You have already used this discount code');
  END IF;

  -- Calculate discount amount
  DECLARE
    discount_amount NUMERIC;
  BEGIN
    IF discount_record.type = 'percentage' THEN
      discount_amount := p_order_total * (discount_record.value / 100);
      IF discount_record.max_discount_amount IS NOT NULL THEN
        discount_amount := LEAST(discount_amount, discount_record.max_discount_amount);
      END IF;
    ELSIF discount_record.type = 'fixed' THEN
      discount_amount := LEAST(discount_record.value, p_order_total);
    ELSE
      discount_amount := 0;
    END IF;

    RETURN json_build_object(
      'valid', true,
      'discount_id', discount_record.id,
      'code', discount_record.code,
      'type', discount_record.type,
      'value', discount_record.value,
      'discount_amount', ROUND(discount_amount, 2),
      'free_shipping', discount_record.free_shipping,
      'message', 'Discount applied successfully'
    );
  END;
END;
$$ LANGUAGE plpgsql;
