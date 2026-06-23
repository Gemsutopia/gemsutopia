// Allowed admin emails (whitelist for Google SSO)
export const ALLOWED_ADMINS = [
  'wilson.asher00@gmail.com',
  'reeseroberge10@gmail.com',
  'gemsutopia@gmail.com',
] as const;

// Admin session settings
export const ADMIN_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
export const ADMIN_SESSION_REFRESH_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in ms

// Cookie settings
export const ADMIN_COOKIE_NAME = 'admin_session';
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: ADMIN_SESSION_DURATION / 1000, // in seconds
  path: '/',
};
