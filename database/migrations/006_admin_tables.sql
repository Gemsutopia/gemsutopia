-- =============================================
-- GEMSUTOPIA DATABASE - ADMIN TABLES
-- Migration 006 - Admin sessions and audit logging
-- For the new admin panel (admin.gemsutopia.ca)
-- =============================================

-- =============================================
-- ADMIN SESSIONS (Google SSO)
-- =============================================

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  admin_name TEXT,
  google_id TEXT,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for admin_sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_email ON admin_sessions(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- =============================================
-- ADMIN AUDIT LOG
-- =============================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  previous_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validate action types
  CONSTRAINT valid_action CHECK (action IN (
    'login', 'logout', 'login_failed',
    'create', 'update', 'delete', 'view', 'export',
    'status_change', 'bulk_action', 'settings_change'
  ))
);

-- Indexes for admin_audit_log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_email ON admin_audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to clean up expired admin sessions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent admin activity
CREATE OR REPLACE FUNCTION get_recent_admin_activity(
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  admin_email TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    aal.id,
    aal.admin_email,
    aal.action,
    aal.resource_type,
    aal.resource_id,
    aal.details,
    aal.created_at
  FROM admin_audit_log aal
  ORDER BY aal.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE admin_sessions IS 'Stores active admin sessions for Google SSO authentication';
COMMENT ON TABLE admin_audit_log IS 'Audit trail for all admin actions';
COMMENT ON FUNCTION cleanup_expired_admin_sessions IS 'Removes expired admin sessions, returns count deleted';
COMMENT ON FUNCTION get_recent_admin_activity IS 'Returns recent admin activity for dashboard display';
