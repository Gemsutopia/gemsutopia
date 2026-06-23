-- =============================================
-- GEMSUTOPIA DATABASE - DASHBOARD STATS FUNCTIONS
-- Migration 004 - Efficient aggregations for dashboard stats
-- =============================================

-- Function to get dashboard stats with efficient DB-level aggregations
-- Uses single pass through orders table with conditional aggregation
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_this_week_start DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  v_last_week_start DATE := DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')::DATE;
  v_last_week_end DATE := v_this_week_start - INTERVAL '1 day';
  v_this_month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  v_last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
  v_last_month_end DATE := v_this_month_start - INTERVAL '1 day';
  v_thirty_days_ago TIMESTAMP WITH TIME ZONE := v_now - INTERVAL '30 days';
  v_sixty_days_ago TIMESTAMP WITH TIME ZONE := v_now - INTERVAL '60 days';

  v_result JSON;
BEGIN
  SELECT json_build_object(
    -- Overall totals
    'totalRevenue', COALESCE(SUM(CAST(total AS NUMERIC)), 0),
    'totalOrders', COUNT(*),
    'totalCustomers', COUNT(DISTINCT customer_email),

    -- Today stats
    'todayRevenue', COALESCE(SUM(CASE WHEN created_at::DATE = v_today THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'todayOrders', COUNT(CASE WHEN created_at::DATE = v_today THEN 1 END),

    -- Yesterday stats
    'yesterdayRevenue', COALESCE(SUM(CASE WHEN created_at::DATE = v_yesterday THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'yesterdayOrders', COUNT(CASE WHEN created_at::DATE = v_yesterday THEN 1 END),

    -- This week stats
    'thisWeekRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= v_this_week_start THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'thisWeekOrders', COUNT(CASE WHEN created_at::DATE >= v_this_week_start THEN 1 END),

    -- Last week stats
    'lastWeekRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= v_last_week_start AND created_at::DATE <= v_last_week_end THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'lastWeekOrders', COUNT(CASE WHEN created_at::DATE >= v_last_week_start AND created_at::DATE <= v_last_week_end THEN 1 END),

    -- This month stats
    'thisMonthRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= v_this_month_start THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'thisMonthOrders', COUNT(CASE WHEN created_at::DATE >= v_this_month_start THEN 1 END),

    -- Last month stats
    'lastMonthRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= v_last_month_start AND created_at::DATE <= v_last_month_end THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'lastMonthOrders', COUNT(CASE WHEN created_at::DATE >= v_last_month_start AND created_at::DATE <= v_last_month_end THEN 1 END),

    -- 30-day vs 60-day comparisons for trend calculation
    'recentRevenue', COALESCE(SUM(CASE WHEN created_at >= v_thirty_days_ago THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'recentOrders', COUNT(CASE WHEN created_at >= v_thirty_days_ago THEN 1 END),
    'recentCustomers', COUNT(DISTINCT CASE WHEN created_at >= v_thirty_days_ago THEN customer_email END),
    'oldRevenue', COALESCE(SUM(CASE WHEN created_at >= v_sixty_days_ago AND created_at < v_thirty_days_ago THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
    'oldOrders', COUNT(CASE WHEN created_at >= v_sixty_days_ago AND created_at < v_thirty_days_ago THEN 1 END),
    'oldCustomers', COUNT(DISTINCT CASE WHEN created_at >= v_sixty_days_ago AND created_at < v_thirty_days_ago THEN customer_email END)
  ) INTO v_result
  FROM orders
  WHERE status = 'confirmed';

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get product stats
CREATE OR REPLACE FUNCTION get_product_stats()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalProducts', COUNT(*) FILTER (WHERE is_active = true),
      'lowStockCount', COUNT(*) FILTER (WHERE is_active = true AND inventory <= 5),
      'outOfStockCount', COUNT(*) FILTER (WHERE is_active = true AND inventory = 0),
      'lowStockProducts', (
        SELECT COALESCE(json_agg(json_build_object(
          'id', id,
          'name', name,
          'inventory', inventory
        )), '[]'::json)
        FROM (
          SELECT id, name, inventory
          FROM products
          WHERE is_active = true AND inventory <= 5
          ORDER BY inventory ASC
          LIMIT 10
        ) low_stock
      )
    )
    FROM products
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(p_limit INTEGER DEFAULT 5)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(product_stats), '[]'::json)
    FROM (
      SELECT
        p.id,
        p.name,
        p.purchase_count as total_sold,
        p.inventory,
        p.price
      FROM products p
      WHERE p.is_active = true AND p.purchase_count > 0
      ORDER BY p.purchase_count DESC
      LIMIT p_limit
    ) product_stats
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get recent orders (optimized)
CREATE OR REPLACE FUNCTION get_recent_orders(p_limit INTEGER DEFAULT 5, p_mode TEXT DEFAULT 'live')
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(order_data), '[]'::json)
    FROM (
      SELECT
        id,
        order_number,
        customer_name,
        customer_email,
        total,
        status,
        payment_status,
        created_at,
        items,
        payment_details
      FROM orders
      WHERE
        CASE
          WHEN p_mode = 'dev' THEN
            payment_details->>'method' = 'test' OR
            payment_details->>'provider' = 'test' OR
            payment_details->>'isTestOrder' = 'true'
          ELSE
            payment_details->>'method' IS DISTINCT FROM 'test' AND
            payment_details->>'provider' IS DISTINCT FROM 'test' AND
            (payment_details->>'isTestOrder' IS NULL OR payment_details->>'isTestOrder' != 'true')
        END
      ORDER BY created_at DESC
      LIMIT p_limit
    ) order_data
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Combined function for dashboard (single call returns all stats)
CREATE OR REPLACE FUNCTION get_full_dashboard_stats(p_mode TEXT DEFAULT 'live')
RETURNS JSON AS $$
DECLARE
  v_order_stats JSON;
  v_product_stats JSON;
  v_top_products JSON;
  v_recent_orders JSON;
BEGIN
  -- Get order stats based on mode
  IF p_mode = 'dev' THEN
    SELECT json_build_object(
      'totalRevenue', COALESCE(SUM(CAST(total AS NUMERIC)), 0),
      'totalOrders', COUNT(*),
      'totalCustomers', COUNT(DISTINCT customer_email),
      'todayRevenue', COALESCE(SUM(CASE WHEN created_at::DATE = CURRENT_DATE THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
      'todayOrders', COUNT(CASE WHEN created_at::DATE = CURRENT_DATE THEN 1 END),
      'thisWeekRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= DATE_TRUNC('week', CURRENT_DATE)::DATE THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
      'thisWeekOrders', COUNT(CASE WHEN created_at::DATE >= DATE_TRUNC('week', CURRENT_DATE)::DATE THEN 1 END),
      'thisMonthRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= DATE_TRUNC('month', CURRENT_DATE)::DATE THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
      'thisMonthOrders', COUNT(CASE WHEN created_at::DATE >= DATE_TRUNC('month', CURRENT_DATE)::DATE THEN 1 END)
    ) INTO v_order_stats
    FROM orders
    WHERE status = 'confirmed'
      AND (payment_details->>'method' = 'test' OR
           payment_details->>'provider' = 'test' OR
           payment_details->>'isTestOrder' = 'true');
  ELSE
    SELECT json_build_object(
      'totalRevenue', COALESCE(SUM(CAST(total AS NUMERIC)), 0),
      'totalOrders', COUNT(*),
      'totalCustomers', COUNT(DISTINCT customer_email),
      'todayRevenue', COALESCE(SUM(CASE WHEN created_at::DATE = CURRENT_DATE THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
      'todayOrders', COUNT(CASE WHEN created_at::DATE = CURRENT_DATE THEN 1 END),
      'thisWeekRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= DATE_TRUNC('week', CURRENT_DATE)::DATE THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
      'thisWeekOrders', COUNT(CASE WHEN created_at::DATE >= DATE_TRUNC('week', CURRENT_DATE)::DATE THEN 1 END),
      'thisMonthRevenue', COALESCE(SUM(CASE WHEN created_at::DATE >= DATE_TRUNC('month', CURRENT_DATE)::DATE THEN CAST(total AS NUMERIC) ELSE 0 END), 0),
      'thisMonthOrders', COUNT(CASE WHEN created_at::DATE >= DATE_TRUNC('month', CURRENT_DATE)::DATE THEN 1 END)
    ) INTO v_order_stats
    FROM orders
    WHERE status = 'confirmed'
      AND payment_details->>'method' IS DISTINCT FROM 'test'
      AND payment_details->>'provider' IS DISTINCT FROM 'test'
      AND (payment_details->>'isTestOrder' IS NULL OR payment_details->>'isTestOrder' != 'true');
  END IF;

  -- Get product stats
  SELECT get_product_stats() INTO v_product_stats;

  -- Get top selling products
  SELECT get_top_selling_products(5) INTO v_top_products;

  -- Get recent orders
  SELECT get_recent_orders(5, p_mode) INTO v_recent_orders;

  RETURN json_build_object(
    'orderStats', v_order_stats,
    'productStats', v_product_stats,
    'topProducts', v_top_products,
    'recentOrders', v_recent_orders
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON FUNCTION get_dashboard_stats IS 'Efficiently calculates all dashboard stats in a single query using conditional aggregation';
COMMENT ON FUNCTION get_product_stats IS 'Returns product statistics including low stock counts';
COMMENT ON FUNCTION get_top_selling_products IS 'Returns top selling products by purchase count';
COMMENT ON FUNCTION get_recent_orders IS 'Returns recent orders with optional mode filtering';
COMMENT ON FUNCTION get_full_dashboard_stats IS 'Combined function for full dashboard stats in a single call';
