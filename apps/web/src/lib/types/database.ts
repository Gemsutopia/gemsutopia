export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  on_sale: boolean;
  category: string;
  images: string[];
  video_url?: string | null;
  featured_image_index?: number;
  tags: string[];
  inventory: number;
  sku: string;
  weight: number | null;
  dimensions: {
    length: number;
    width: number;
    height: number;
  } | null;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  metadata: {
    origin?: string;
    gem_type?: string;
    cut?: string;
    carat?: number;
    clarity?: string;
    color?: string;
    card_color?: string;
    card_gradient_from?: string;
    card_gradient_to?: string;
    use_gradient?: boolean;
    details?: string[];
    shipping_info?: string;
    video_url?: string | null;
    featured_image_index?: number;
    view_count?: number;
    wishlist_count?: number;
    frontend_visible?: boolean;
  } | null;
}

export interface SiteContent {
  id: string;
  section: string;
  key: string;
  content_type: 'text' | 'html' | 'image' | 'json' | 'color' | 'checkbox';
  value: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  title?: string;
  content: string;
  product_id?: string;
  images: string[];
  is_featured: boolean;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  id: string;
  page_slug: string;
  title?: string;
  content?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  filename: string;
  original_filename?: string;
  url: string;
  mime_type?: string;
  size_bytes?: number;
  alt_text?: string;
  caption?: string;
  usage_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      site_content: {
        Row: SiteContent;
        Insert: Omit<SiteContent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SiteContent, 'id' | 'created_at' | 'updated_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>;
      };
      faqs: {
        Row: FAQ;
        Insert: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FAQ, 'id' | 'created_at' | 'updated_at'>>;
      };
      page_content: {
        Row: PageContent;
        Insert: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PageContent, 'id' | 'created_at' | 'updated_at'>>;
      };
      media: {
        Row: Media;
        Insert: Omit<Media, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Media, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
