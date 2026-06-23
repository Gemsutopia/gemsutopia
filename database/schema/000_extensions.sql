-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 000_extensions.sql - PostgreSQL Extensions
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Text search (trigram)

-- Note: If using Supabase, these are typically enabled by default
