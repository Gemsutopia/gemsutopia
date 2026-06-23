import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Storage buckets
export const BUCKETS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BANNERS: 'banners',
  USER_CONTENT: 'user-content',
  REVIEWS: 'reviews',
} as const;

// Initialize Supabase client (server-side only)
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('Supabase storage not configured - missing environment variables');
    return null;
  }

  supabase = createClient(url, key);
  return supabase;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// Upload file to storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<UploadResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Storage not configured' };
  }

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Upload image with optimized path
export async function uploadImage(
  bucket: string,
  filename: string,
  file: File | Buffer,
  folder?: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = folder ? `${folder}/${timestamp}-${safeName}` : `${timestamp}-${safeName}`;

  return uploadFile(bucket, path, file);
}

// Upload product image
export async function uploadProductImage(
  productId: string,
  filename: string,
  file: File | Buffer
): Promise<UploadResult> {
  return uploadImage(BUCKETS.PRODUCTS, filename, file, productId);
}

// Upload category image
export async function uploadCategoryImage(
  categoryId: string,
  filename: string,
  file: File | Buffer
): Promise<UploadResult> {
  return uploadImage(BUCKETS.CATEGORIES, filename, file, categoryId);
}

// Upload banner image
export async function uploadBannerImage(
  filename: string,
  file: File | Buffer
): Promise<UploadResult> {
  return uploadImage(BUCKETS.BANNERS, filename, file);
}

// Delete file from storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.storage.from(bucket).remove([path]);
    return !error;
  } catch {
    return false;
  }
}

// Delete multiple files
export async function deleteFiles(bucket: string, paths: string[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.storage.from(bucket).remove(paths);
    return !error;
  } catch {
    return false;
  }
}

// Get public URL for a file
export function getPublicUrl(bucket: string, path: string): string | null {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// File object type from Supabase
export interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, unknown>;
}

// List files in a folder
export async function listFiles(bucket: string, folder?: string): Promise<StorageFile[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) return [];
    return data as StorageFile[];
  } catch {
    return [];
  }
}
