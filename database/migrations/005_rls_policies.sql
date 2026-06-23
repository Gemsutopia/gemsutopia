-- ============================================================================
-- RLS (Row Level Security) Policies Migration
-- Protects user-owned data at the database level
-- ============================================================================

-- Enable RLS on tables (does not affect queries until policies are added)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper Functions for RLS
-- These functions read from session configuration variables set per-request
-- ============================================================================

-- Get current user ID from session config
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get current user email from session config
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS text AS $$
  SELECT NULLIF(current_setting('app.current_user_email', TRUE), '');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_current_admin()
RETURNS boolean AS $$
  SELECT COALESCE(current_setting('app.is_admin', TRUE), 'false')::boolean;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Set auth context (called at the start of each request)
CREATE OR REPLACE FUNCTION set_auth_context(
  p_user_id uuid DEFAULT NULL,
  p_user_email text DEFAULT NULL,
  p_is_admin boolean DEFAULT FALSE
)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', COALESCE(p_user_id::text, ''), TRUE);
  PERFORM set_config('app.current_user_email', COALESCE(p_user_email, ''), TRUE);
  PERFORM set_config('app.is_admin', p_is_admin::text, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear auth context (called at end of request or on error)
CREATE OR REPLACE FUNCTION clear_auth_context()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', TRUE);
  PERFORM set_config('app.current_user_email', '', TRUE);
  PERFORM set_config('app.is_admin', 'false', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS Policies: Orders
-- Users can see their own orders (by user_id or customer_email)
-- Admins can see all orders
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS orders_select_policy ON orders;
DROP POLICY IF EXISTS orders_insert_policy ON orders;
DROP POLICY IF EXISTS orders_update_policy ON orders;
DROP POLICY IF EXISTS orders_delete_policy ON orders;

-- SELECT: Users see their own orders, admins see all
CREATE POLICY orders_select_policy ON orders
  FOR SELECT USING (
    is_current_admin() OR
    user_id = current_user_id() OR
    customer_email = current_user_email()
  );

-- INSERT: Authenticated users can create orders
CREATE POLICY orders_insert_policy ON orders
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    user_id = current_user_id() OR
    user_id IS NULL  -- Allow guest orders
  );

-- UPDATE: Users can update their own orders (limited), admins can update all
CREATE POLICY orders_update_policy ON orders
  FOR UPDATE USING (
    is_current_admin() OR
    user_id = current_user_id() OR
    customer_email = current_user_email()
  );

-- DELETE: Only admins can delete orders
CREATE POLICY orders_delete_policy ON orders
  FOR DELETE USING (is_current_admin());

-- ============================================================================
-- RLS Policies: Carts
-- Users can only see/modify their own cart
-- ============================================================================

DROP POLICY IF EXISTS carts_select_policy ON carts;
DROP POLICY IF EXISTS carts_insert_policy ON carts;
DROP POLICY IF EXISTS carts_update_policy ON carts;
DROP POLICY IF EXISTS carts_delete_policy ON carts;

CREATE POLICY carts_select_policy ON carts
  FOR SELECT USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY carts_insert_policy ON carts
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY carts_update_policy ON carts
  FOR UPDATE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY carts_delete_policy ON carts
  FOR DELETE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

-- ============================================================================
-- RLS Policies: Cart Items
-- Users can only see/modify items in their own cart
-- ============================================================================

DROP POLICY IF EXISTS cart_items_select_policy ON cart_items;
DROP POLICY IF EXISTS cart_items_insert_policy ON cart_items;
DROP POLICY IF EXISTS cart_items_update_policy ON cart_items;
DROP POLICY IF EXISTS cart_items_delete_policy ON cart_items;

CREATE POLICY cart_items_select_policy ON cart_items
  FOR SELECT USING (
    is_current_admin() OR
    cart_id IN (SELECT id FROM carts WHERE user_id = current_user_id())
  );

CREATE POLICY cart_items_insert_policy ON cart_items
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    cart_id IN (SELECT id FROM carts WHERE user_id = current_user_id())
  );

CREATE POLICY cart_items_update_policy ON cart_items
  FOR UPDATE USING (
    is_current_admin() OR
    cart_id IN (SELECT id FROM carts WHERE user_id = current_user_id())
  );

CREATE POLICY cart_items_delete_policy ON cart_items
  FOR DELETE USING (
    is_current_admin() OR
    cart_id IN (SELECT id FROM carts WHERE user_id = current_user_id())
  );

-- ============================================================================
-- RLS Policies: Wishlists
-- Users can only see/modify their own wishlist
-- ============================================================================

DROP POLICY IF EXISTS wishlists_select_policy ON wishlists;
DROP POLICY IF EXISTS wishlists_insert_policy ON wishlists;
DROP POLICY IF EXISTS wishlists_update_policy ON wishlists;
DROP POLICY IF EXISTS wishlists_delete_policy ON wishlists;

CREATE POLICY wishlists_select_policy ON wishlists
  FOR SELECT USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY wishlists_insert_policy ON wishlists
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY wishlists_update_policy ON wishlists
  FOR UPDATE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY wishlists_delete_policy ON wishlists
  FOR DELETE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

-- ============================================================================
-- RLS Policies: Wishlist Items
-- Users can only see/modify items in their own wishlist
-- ============================================================================

DROP POLICY IF EXISTS wishlist_items_select_policy ON wishlist_items;
DROP POLICY IF EXISTS wishlist_items_insert_policy ON wishlist_items;
DROP POLICY IF EXISTS wishlist_items_update_policy ON wishlist_items;
DROP POLICY IF EXISTS wishlist_items_delete_policy ON wishlist_items;

CREATE POLICY wishlist_items_select_policy ON wishlist_items
  FOR SELECT USING (
    is_current_admin() OR
    wishlist_id IN (SELECT id FROM wishlists WHERE user_id = current_user_id())
  );

CREATE POLICY wishlist_items_insert_policy ON wishlist_items
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    wishlist_id IN (SELECT id FROM wishlists WHERE user_id = current_user_id())
  );

CREATE POLICY wishlist_items_update_policy ON wishlist_items
  FOR UPDATE USING (
    is_current_admin() OR
    wishlist_id IN (SELECT id FROM wishlists WHERE user_id = current_user_id())
  );

CREATE POLICY wishlist_items_delete_policy ON wishlist_items
  FOR DELETE USING (
    is_current_admin() OR
    wishlist_id IN (SELECT id FROM wishlists WHERE user_id = current_user_id())
  );

-- ============================================================================
-- RLS Policies: Payments
-- Users can see payments for their own orders
-- ============================================================================

DROP POLICY IF EXISTS payments_select_policy ON payments;
DROP POLICY IF EXISTS payments_insert_policy ON payments;
DROP POLICY IF EXISTS payments_update_policy ON payments;

CREATE POLICY payments_select_policy ON payments
  FOR SELECT USING (
    is_current_admin() OR
    order_id IN (
      SELECT id FROM orders
      WHERE user_id = current_user_id() OR customer_email = current_user_email()
    )
  );

CREATE POLICY payments_insert_policy ON payments
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    order_id IN (
      SELECT id FROM orders
      WHERE user_id = current_user_id() OR customer_email = current_user_email()
    )
  );

CREATE POLICY payments_update_policy ON payments
  FOR UPDATE USING (is_current_admin());

-- ============================================================================
-- RLS Policies: Refund Requests
-- Users can see/create refund requests for their own orders
-- ============================================================================

DROP POLICY IF EXISTS refund_requests_select_policy ON refund_requests;
DROP POLICY IF EXISTS refund_requests_insert_policy ON refund_requests;
DROP POLICY IF EXISTS refund_requests_update_policy ON refund_requests;

CREATE POLICY refund_requests_select_policy ON refund_requests
  FOR SELECT USING (
    is_current_admin() OR
    user_id = current_user_id() OR
    customer_email = current_user_email()
  );

CREATE POLICY refund_requests_insert_policy ON refund_requests
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY refund_requests_update_policy ON refund_requests
  FOR UPDATE USING (is_current_admin());

-- ============================================================================
-- RLS Policies: Store Credits
-- Users can see their own store credits
-- ============================================================================

DROP POLICY IF EXISTS store_credits_select_policy ON store_credits;
DROP POLICY IF EXISTS store_credits_insert_policy ON store_credits;
DROP POLICY IF EXISTS store_credits_update_policy ON store_credits;

CREATE POLICY store_credits_select_policy ON store_credits
  FOR SELECT USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY store_credits_insert_policy ON store_credits
  FOR INSERT WITH CHECK (is_current_admin());

CREATE POLICY store_credits_update_policy ON store_credits
  FOR UPDATE USING (is_current_admin());

-- ============================================================================
-- RLS Policies: Notifications
-- Users can see their own notifications
-- ============================================================================

DROP POLICY IF EXISTS notifications_select_policy ON notifications;
DROP POLICY IF EXISTS notifications_insert_policy ON notifications;
DROP POLICY IF EXISTS notifications_update_policy ON notifications;
DROP POLICY IF EXISTS notifications_delete_policy ON notifications;

CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY notifications_insert_policy ON notifications
  FOR INSERT WITH CHECK (is_current_admin());

CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY notifications_delete_policy ON notifications
  FOR DELETE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

-- ============================================================================
-- RLS Policies: Bids
-- Users can see all bids (public auction info) but only modify their own
-- ============================================================================

DROP POLICY IF EXISTS bids_select_policy ON bids;
DROP POLICY IF EXISTS bids_insert_policy ON bids;
DROP POLICY IF EXISTS bids_update_policy ON bids;
DROP POLICY IF EXISTS bids_delete_policy ON bids;

-- All authenticated users can see bids (public auction info)
CREATE POLICY bids_select_policy ON bids
  FOR SELECT USING (TRUE);

CREATE POLICY bids_insert_policy ON bids
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY bids_update_policy ON bids
  FOR UPDATE USING (is_current_admin());

CREATE POLICY bids_delete_policy ON bids
  FOR DELETE USING (is_current_admin());

-- ============================================================================
-- RLS Policies: Reviews
-- Users can see all approved reviews, but only modify their own
-- ============================================================================

DROP POLICY IF EXISTS reviews_select_policy ON reviews;
DROP POLICY IF EXISTS reviews_insert_policy ON reviews;
DROP POLICY IF EXISTS reviews_update_policy ON reviews;
DROP POLICY IF EXISTS reviews_delete_policy ON reviews;

-- Everyone can see approved reviews, users can see all their own
CREATE POLICY reviews_select_policy ON reviews
  FOR SELECT USING (
    is_current_admin() OR
    status = 'approved' OR
    user_id = current_user_id() OR
    customer_email = current_user_email()
  );

CREATE POLICY reviews_insert_policy ON reviews
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY reviews_update_policy ON reviews
  FOR UPDATE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY reviews_delete_policy ON reviews
  FOR DELETE USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

-- ============================================================================
-- RLS Policies: Referrals
-- Users can see their own referrals (as referrer or referee)
-- ============================================================================

DROP POLICY IF EXISTS referrals_select_policy ON referrals;
DROP POLICY IF EXISTS referrals_insert_policy ON referrals;
DROP POLICY IF EXISTS referrals_update_policy ON referrals;

CREATE POLICY referrals_select_policy ON referrals
  FOR SELECT USING (
    is_current_admin() OR
    referrer_id = current_user_id() OR
    referrer_email = current_user_email()
  );

CREATE POLICY referrals_insert_policy ON referrals
  FOR INSERT WITH CHECK (
    is_current_admin() OR
    referrer_id = current_user_id()
  );

CREATE POLICY referrals_update_policy ON referrals
  FOR UPDATE USING (is_current_admin());

-- ============================================================================
-- RLS Policies: Customer Loyalty
-- Users can see their own loyalty status
-- ============================================================================

DROP POLICY IF EXISTS customer_loyalty_select_policy ON customer_loyalty;
DROP POLICY IF EXISTS customer_loyalty_insert_policy ON customer_loyalty;
DROP POLICY IF EXISTS customer_loyalty_update_policy ON customer_loyalty;

CREATE POLICY customer_loyalty_select_policy ON customer_loyalty
  FOR SELECT USING (
    is_current_admin() OR
    user_id = current_user_id()
  );

CREATE POLICY customer_loyalty_insert_policy ON customer_loyalty
  FOR INSERT WITH CHECK (is_current_admin());

CREATE POLICY customer_loyalty_update_policy ON customer_loyalty
  FOR UPDATE USING (is_current_admin());

-- ============================================================================
-- IMPORTANT: Create a bypass role for the application
-- The application itself needs to bypass RLS to set context and perform
-- initial queries. This is done by using the service role.
-- ============================================================================

-- Note: In Neon PostgreSQL, you typically use the neondb_owner role or
-- create a specific service role. The application connects as this role
-- and sets the auth context per-request.

-- Grant the app user ability to set session variables
-- (This is handled by Neon's default configuration)

COMMENT ON FUNCTION set_auth_context IS 'Sets the auth context for RLS policies. Call at the start of each request.';
COMMENT ON FUNCTION clear_auth_context IS 'Clears the auth context. Call on errors or at end of request.';
COMMENT ON FUNCTION current_user_id IS 'Returns the current authenticated user ID from session config.';
COMMENT ON FUNCTION current_user_email IS 'Returns the current authenticated user email from session config.';
COMMENT ON FUNCTION is_current_admin IS 'Returns whether the current user is an admin.';
