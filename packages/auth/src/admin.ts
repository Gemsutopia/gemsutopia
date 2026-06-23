// Admin auth was part of the old monolith.
// Gemsutopia is now a frontend shell managed by Quickdash.
// This module is retained as a stub for build compatibility.

export interface AdminUser {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  googleId: string;
  createdAt: string;
  expiresAt: string;
}

export function isAllowedAdmin(_email: string): boolean {
  return false;
}
