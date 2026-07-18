// Environment variable validation
// This file validates required environment variables at build/startup time

const requiredEnvVars = [
  'NEXT_PUBLIC_STOREFRONT_API_KEY',
] as const;

const optionalEnvVars = [
  // Quickdash Storefront API
  'NEXT_PUBLIC_STOREFRONT_URL',
  // Storage (Supabase)
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  // Cloudflare Turnstile (optional - for spam protection)
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
] as const;

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required vars
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional vars and warn
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

// Validate on import (server-side only)
if (typeof window === 'undefined') {
  const result = validateEnv();

  if (!result.valid) {
    // In production, throw an error to prevent startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${result.missing.join(', ')}`
      );
    }
  }
}

// Type-safe env access
export const env = {
  // Quickdash Storefront API
  STOREFRONT_API_KEY: process.env.NEXT_PUBLIC_STOREFRONT_API_KEY,
  STOREFRONT_URL: process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://app.quickdash.net',

  // Storage
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Flags
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
