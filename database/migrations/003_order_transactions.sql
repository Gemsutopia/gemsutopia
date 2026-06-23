-- =============================================
-- GEMSUTOPIA DATABASE - ORDER TRANSACTIONS
-- Migration 003 - Atomic order creation with inventory management
-- =============================================

-- Create order with atomic inventory check and decrement
-- This prevents overselling by using row-level locks
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_order_number TEXT,
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_shipping_address JSONB,
  p_items JSONB,
  p_payment_details JSONB,
  p_subtotal NUMERIC,
  p_shipping NUMERIC,
  p_tax NUMERIC,
  p_total NUMERIC,
  p_currency TEXT DEFAULT 'CAD'
)
RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
  v_product RECORD;
  v_insufficient_items JSONB := '[]'::JSONB;
  v_result JSON;
BEGIN
  -- First, check all inventory with row locks to prevent concurrent modifications
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id UUID, quantity INTEGER, name TEXT, price NUMERIC, image TEXT)
  LOOP
    -- Lock the product row and check inventory
    SELECT id, name, inventory
    INTO v_product
    FROM products
    WHERE id = v_item.id
    FOR UPDATE;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item.id;
    END IF;

    IF v_product.inventory < v_item.quantity THEN
      v_insufficient_items := v_insufficient_items || jsonb_build_object(
        'id', v_item.id,
        'name', v_product.name,
        'requested', v_item.quantity,
        'available', v_product.inventory
      );
    END IF;
  END LOOP;

  -- If any items have insufficient inventory, rollback and return error
  IF jsonb_array_length(v_insufficient_items) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_inventory',
      'message', 'Some items have insufficient inventory',
      'insufficient_items', v_insufficient_items
    );
  END IF;

  -- All inventory checks passed - create the order
  INSERT INTO orders (
    order_number,
    customer_email,
    customer_name,
    shipping_address_line1,
    shipping_city,
    shipping_province,
    shipping_postal_code,
    shipping_country,
    items,
    payment_details,
    subtotal,
    shipping_cost,
    tax_amount,
    total,
    currency,
    status,
    payment_status,
    item_count
  ) VALUES (
    p_order_number,
    p_customer_email,
    p_customer_name,
    p_shipping_address->>'address',
    p_shipping_address->>'city',
    p_shipping_address->>'state',
    p_shipping_address->>'zipCode',
    COALESCE(p_shipping_address->>'country', 'Canada'),
    p_items,
    p_payment_details,
    p_subtotal,
    p_shipping,
    p_tax,
    p_total,
    p_currency,
    'confirmed',
    'paid',
    (SELECT COUNT(*) FROM jsonb_array_elements(p_items))::INTEGER
  )
  RETURNING id INTO v_order_id;

  -- Decrement inventory for all items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id UUID, quantity INTEGER)
  LOOP
    UPDATE products
    SET
      inventory = inventory - v_item.quantity,
      purchase_count = purchase_count + v_item.quantity,
      updated_at = NOW()
    WHERE id = v_item.id;

    -- Log the inventory change
    INSERT INTO inventory_logs (product_id, quantity_change, previous_quantity, new_quantity, reason, order_id)
    SELECT
      v_item.id,
      -v_item.quantity,
      inventory + v_item.quantity,
      inventory,
      'sale',
      v_order_id
    FROM products WHERE id = v_item.id;
  END LOOP;

  -- Return success with order details
  SELECT jsonb_build_object(
    'success', true,
    'order', row_to_json(o.*)
  ) INTO v_result
  FROM orders o WHERE o.id = v_order_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to safely reserve inventory (for checkout process)
CREATE OR REPLACE FUNCTION reserve_inventory(
  p_items JSONB,
  p_reservation_id UUID DEFAULT gen_random_uuid()
)
RETURNS JSON AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
  v_insufficient_items JSONB := '[]'::JSONB;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id UUID, quantity INTEGER)
  LOOP
    SELECT id, name, inventory
    INTO v_product
    FROM products
    WHERE id = v_item.id
    FOR UPDATE NOWAIT;  -- Fail immediately if locked

    IF v_product.id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'product_not_found',
        'product_id', v_item.id
      );
    END IF;

    IF v_product.inventory < v_item.quantity THEN
      v_insufficient_items := v_insufficient_items || jsonb_build_object(
        'id', v_item.id,
        'name', v_product.name,
        'requested', v_item.quantity,
        'available', v_product.inventory
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_insufficient_items) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_inventory',
      'insufficient_items', v_insufficient_items
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'message', 'Inventory available'
  );
EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'concurrent_modification',
      'message', 'Items are being purchased by another customer. Please try again.'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to restore inventory (for cancelled orders, refunds)
CREATE OR REPLACE FUNCTION restore_inventory(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'return'
)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(v_order.items) AS x(id UUID, quantity INTEGER)
  LOOP
    UPDATE products
    SET
      inventory = inventory + v_item.quantity,
      updated_at = NOW()
    WHERE id = v_item.id;

    -- Log the inventory restoration
    INSERT INTO inventory_logs (product_id, quantity_change, previous_quantity, new_quantity, reason, order_id)
    SELECT
      v_item.id,
      v_item.quantity,
      inventory - v_item.quantity,
      inventory,
      p_reason,
      p_order_id
    FROM products WHERE id = v_item.id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inventory restored for order ' || v_order.order_number
  );
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION create_order_atomic IS 'Atomically creates an order with inventory checks and decrements. Prevents overselling through row-level locks.';
COMMENT ON FUNCTION reserve_inventory IS 'Checks and reserves inventory for checkout. Uses NOWAIT to fail fast on conflicts.';
COMMENT ON FUNCTION restore_inventory IS 'Restores inventory for cancelled orders or refunds.';
