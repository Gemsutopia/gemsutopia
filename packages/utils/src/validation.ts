import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().regex(
  /^[\d\s\-\+\(\)]+$/,
  'Invalid phone number'
);

export const postalCodeSchema = z.string().regex(
  /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  'Invalid postal code (format: A1A 1A1)'
);

export const uuidSchema = z.string().uuid('Invalid ID');

export const priceSchema = z.coerce.number().min(0, 'Price must be positive');

export const quantitySchema = z.coerce.number().int().min(1, 'Quantity must be at least 1');

// Canadian province codes
export const CANADIAN_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
] as const;

export const provinceSchema = z.enum(CANADIAN_PROVINCES);

// Address schema
export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: provinceSchema,
  postalCode: postalCodeSchema,
  country: z.string().default('Canada'),
  phone: phoneSchema.optional(),
});

export type Address = z.infer<typeof addressSchema>;

// Validate email
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

// Validate postal code
export function isValidPostalCode(postalCode: string): boolean {
  return postalCodeSchema.safeParse(postalCode).success;
}

// Validate UUID
export function isValidUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

// Sanitize input (basic - for HTML use DOMPurify on the client)
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

// Generate random string
export function generateRandomString(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = generateRandomString(4).toUpperCase();
  return `GU-${timestamp}-${random}`;
}

// Generate referral code
export function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
