-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"meta_title" text,
	"meta_description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "categories_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"short_description" text,
	"price" numeric(10, 2) NOT NULL,
	"sale_price" numeric(10, 2),
	"on_sale" boolean DEFAULT false,
	"cost_price" numeric(10, 2),
	"inventory" integer DEFAULT 0,
	"sku" text,
	"track_inventory" boolean DEFAULT true,
	"low_stock_threshold" integer DEFAULT 5,
	"images" text[] DEFAULT '{""}',
	"featured_image_index" integer DEFAULT 0,
	"video_url" text,
	"category_id" uuid,
	"gemstone_type" text,
	"carat_weight" numeric(6, 3),
	"cut" text,
	"clarity" text,
	"color" text,
	"origin" text,
	"treatment" text,
	"certification" text,
	"certification_number" text,
	"dimensions" jsonb,
	"weight" numeric(10, 3),
	"shape" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"is_new" boolean DEFAULT false,
	"is_bestseller" boolean DEFAULT false,
	"meta_title" text,
	"meta_description" text,
	"view_count" integer DEFAULT 0,
	"purchase_count" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"tags" text[] DEFAULT '{""}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "products_slug_key" UNIQUE("slug"),
	CONSTRAINT "products_sku_key" UNIQUE("sku"),
	CONSTRAINT "products_price_check" CHECK (price >= (0)::numeric),
	CONSTRAINT "products_sale_price_check" CHECK ((sale_price IS NULL) OR (sale_price >= (0)::numeric)),
	CONSTRAINT "products_inventory_check" CHECK (inventory >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"provider" text NOT NULL,
	"provider_payment_id" text,
	"provider_customer_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'CAD',
	"fee_amount" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(10, 2),
	"status" text DEFAULT 'pending',
	"payment_method_type" text,
	"payment_method_details" jsonb DEFAULT '{}'::jsonb,
	"refund_amount" numeric(10, 2) DEFAULT '0',
	"refund_reason" text,
	"refunded_at" timestamp with time zone,
	"provider_response" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payments_provider_check" CHECK (provider = ANY (ARRAY['stripe'::text, 'paypal'::text, 'btc'::text, 'manual'::text])),
	CONSTRAINT "payments_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'succeeded'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text]))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"avatar_url" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"country" text DEFAULT 'Canada',
	"email_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"role" text DEFAULT 'customer',
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"currency" text DEFAULT 'CAD',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_role_check" CHECK (role = ANY (ARRAY['customer'::text, 'admin'::text, 'super_admin'::text]))
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"user_id" uuid,
	"customer_email" text NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"shipping_address_line1" text,
	"shipping_address_line2" text,
	"shipping_city" text,
	"shipping_province" text,
	"shipping_postal_code" text,
	"shipping_country" text DEFAULT 'Canada',
	"billing_same_as_shipping" boolean DEFAULT true,
	"billing_address_line1" text,
	"billing_address_line2" text,
	"billing_city" text,
	"billing_province" text,
	"billing_postal_code" text,
	"billing_country" text,
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'CAD',
	"discount_code" text,
	"discount_id" uuid,
	"status" text DEFAULT 'pending',
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"payment_details" jsonb DEFAULT '{}'::jsonb,
	"shipping_method" text,
	"tracking_number" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"item_count" integer DEFAULT 0,
	"customer_notes" text,
	"admin_notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "orders_order_number_key" UNIQUE("order_number"),
	CONSTRAINT "orders_subtotal_check" CHECK (subtotal >= (0)::numeric),
	CONSTRAINT "orders_shipping_cost_check" CHECK (shipping_cost >= (0)::numeric),
	CONSTRAINT "orders_tax_amount_check" CHECK (tax_amount >= (0)::numeric),
	CONSTRAINT "orders_discount_amount_check" CHECK (discount_amount >= (0)::numeric),
	CONSTRAINT "orders_total_check" CHECK (total >= (0)::numeric),
	CONSTRAINT "orders_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'refunded'::text, 'failed'::text, 'disputed'::text, 'on_hold'::text])),
	CONSTRAINT "orders_payment_method_check" CHECK (payment_method = ANY (ARRAY['stripe'::text, 'paypal'::text, 'crypto'::text, 'btc'::text])),
	CONSTRAINT "orders_payment_status_check" CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text, 'partially_refunded'::text]))
);
--> statement-breakpoint
CREATE TABLE "auctions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"description" text,
	"images" text[] DEFAULT '{""}',
	"featured_image_index" integer DEFAULT 0,
	"video_url" text,
	"starting_bid" numeric(10, 2) NOT NULL,
	"current_bid" numeric(10, 2) DEFAULT '0',
	"reserve_price" numeric(10, 2),
	"buy_now_price" numeric(10, 2),
	"bid_increment" numeric(10, 2) DEFAULT '1.00',
	"currency" text DEFAULT 'CAD',
	"bid_count" integer DEFAULT 0,
	"highest_bidder_id" uuid,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"extended_end_time" timestamp with time zone,
	"auto_extend" boolean DEFAULT true,
	"extend_minutes" integer DEFAULT 5,
	"extend_threshold_minutes" integer DEFAULT 5,
	"status" text DEFAULT 'pending',
	"is_active" boolean DEFAULT true,
	"winner_id" uuid,
	"winning_bid" numeric(10, 2),
	"won_at" timestamp with time zone,
	"product_id" uuid,
	"gemstone_type" text,
	"carat_weight" numeric(6, 3),
	"cut" text,
	"clarity" text,
	"color" text,
	"origin" text,
	"certification" text,
	"meta_title" text,
	"meta_description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "auctions_slug_key" UNIQUE("slug"),
	CONSTRAINT "auctions_starting_bid_check" CHECK (starting_bid >= (0)::numeric),
	CONSTRAINT "auctions_current_bid_check" CHECK (current_bid >= (0)::numeric),
	CONSTRAINT "auctions_check" CHECK ((reserve_price IS NULL) OR (reserve_price >= starting_bid)),
	CONSTRAINT "auctions_check1" CHECK ((buy_now_price IS NULL) OR (buy_now_price > starting_bid)),
	CONSTRAINT "auctions_bid_increment_check" CHECK (bid_increment > (0)::numeric),
	CONSTRAINT "auctions_bid_count_check" CHECK (bid_count >= 0),
	CONSTRAINT "auctions_check2" CHECK (end_time > start_time),
	CONSTRAINT "auctions_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'scheduled'::text, 'active'::text, 'ended'::text, 'sold'::text, 'cancelled'::text, 'no_sale'::text]))
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"product_name" text NOT NULL,
	"product_sku" text,
	"product_image" text,
	"unit_price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"product_details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "order_items_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auction_id" uuid NOT NULL,
	"user_id" uuid,
	"bidder_email" text NOT NULL,
	"bidder_name" text,
	"amount" numeric(10, 2) NOT NULL,
	"max_bid" numeric(10, 2),
	"is_auto_bid" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"is_winning" boolean DEFAULT false,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "bids_amount_check" CHECK (amount > (0)::numeric),
	CONSTRAINT "bids_status_check" CHECK (status = ANY (ARRAY['active'::text, 'outbid'::text, 'winning'::text, 'won'::text, 'cancelled'::text, 'retracted'::text]))
);
--> statement-breakpoint
CREATE TABLE "auction_watchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auction_id" uuid NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"notify_outbid" boolean DEFAULT true,
	"notify_ending" boolean DEFAULT true,
	"notify_result" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "auction_watchers_auction_id_email_key" UNIQUE("auction_id","email")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"user_id" uuid,
	"order_id" uuid,
	"reviewer_name" text,
	"reviewer_email" text,
	"rating" integer NOT NULL,
	"title" text,
	"content" text,
	"images" text[] DEFAULT '{""}',
	"verified_purchase" boolean DEFAULT false,
	"status" text DEFAULT 'pending',
	"is_featured" boolean DEFAULT false,
	"admin_response" text,
	"admin_response_at" timestamp with time zone,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reviews_rating_check" CHECK ((rating >= 1) AND (rating <= 5)),
	CONSTRAINT "reviews_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'flagged'::text]))
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"guest_email" text,
	"session_id" text,
	"name" text DEFAULT 'My Wishlist',
	"is_public" boolean DEFAULT false,
	"share_token" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "wishlists_share_token_key" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"notes" text,
	"priority" integer DEFAULT 0,
	"added_price" numeric(10, 2),
	"notify_price_drop" boolean DEFAULT true,
	"notify_back_in_stock" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "wishlist_items_wishlist_id_product_id_key" UNIQUE("wishlist_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"guest_email" text,
	"status" text DEFAULT 'active',
	"item_count" integer DEFAULT 0,
	"subtotal" numeric(10, 2) DEFAULT '0',
	"discount_code" text,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone DEFAULT (now() + '30 days'::interval),
	CONSTRAINT "carts_status_check" CHECK (status = ANY (ARRAY['active'::text, 'abandoned'::text, 'converted'::text, 'merged'::text]))
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"sale_price" numeric(10, 2),
	"product_snapshot" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE("cart_id","product_id"),
	CONSTRAINT "cart_items_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"action_text" text,
	"order_id" uuid,
	"product_id" uuid,
	"auction_id" uuid,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp with time zone,
	"is_email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp with time zone,
	"priority" text DEFAULT 'normal',
	"expires_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "notifications_type_check" CHECK (type = ANY (ARRAY['order_confirmation'::text, 'order_shipped'::text, 'order_delivered'::text, 'bid_placed'::text, 'outbid'::text, 'auction_won'::text, 'auction_lost'::text, 'auction_ending'::text, 'price_drop'::text, 'back_in_stock'::text, 'wishlist_sale'::text, 'review_approved'::text, 'review_response'::text, 'welcome'::text, 'password_reset'::text, 'account_update'::text, 'promo'::text, 'newsletter'::text, 'system'::text])),
	CONSTRAINT "notifications_priority_check" CHECK (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))
);
--> statement-breakpoint
CREATE TABLE "email_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"user_id" uuid,
	"newsletter" boolean DEFAULT true,
	"promotions" boolean DEFAULT true,
	"order_updates" boolean DEFAULT true,
	"auction_updates" boolean DEFAULT true,
	"price_alerts" boolean DEFAULT true,
	"stock_alerts" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"verification_token" text,
	"verified_at" timestamp with time zone,
	"unsubscribe_token" text,
	"unsubscribed_at" timestamp with time zone,
	"source" text DEFAULT 'website',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_subscriptions_email_key" UNIQUE("email"),
	CONSTRAINT "email_subscriptions_unsubscribe_token_key" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "gem_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"short_content" text,
	"image" text,
	"video_url" text,
	"gemstone_type" text,
	"category" text DEFAULT 'general',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"source" text,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"excerpt" text,
	"template" text DEFAULT 'default',
	"featured_image" text,
	"status" text DEFAULT 'draft',
	"is_in_menu" boolean DEFAULT false,
	"menu_order" integer DEFAULT 0,
	"meta_title" text,
	"meta_description" text,
	"og_image" text,
	"requires_auth" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"published_at" timestamp with time zone,
	CONSTRAINT "pages_slug_key" UNIQUE("slug"),
	CONSTRAINT "pages_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'general',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discount_code_id" uuid NOT NULL,
	"order_id" uuid,
	"user_id" uuid,
	"customer_email" text NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL,
	"used_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new',
	"replied_at" timestamp with time zone,
	"reply_message" text,
	"ip_address" text,
	"user_agent" text,
	"source" text DEFAULT 'contact_form',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "contact_submissions_status_check" CHECK (status = ANY (ARRAY['new'::text, 'read'::text, 'replied'::text, 'spam'::text, 'archived'::text]))
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"image" text NOT NULL,
	"mobile_image" text,
	"video_url" text,
	"link_url" text,
	"link_text" text,
	"link_target" text DEFAULT '_self',
	"position" text DEFAULT 'homepage_hero',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"text_color" text DEFAULT '#ffffff',
	"overlay_color" text,
	"overlay_opacity" numeric(3, 2) DEFAULT '0.3',
	"text_position" text DEFAULT 'center',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"type" text DEFAULT 'string',
	"category" text DEFAULT 'general',
	"label" text,
	"description" text,
	"is_required" boolean DEFAULT false,
	"validation_rules" jsonb DEFAULT '{}'::jsonb,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "site_settings_key_key" UNIQUE("key"),
	CONSTRAINT "site_settings_type_check" CHECK (type = ANY (ARRAY['string'::text, 'number'::text, 'boolean'::text, 'json'::text, 'array'::text, 'html'::text]))
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"max_discount_amount" numeric(10, 2),
	"minimum_order_amount" numeric(10, 2) DEFAULT '0',
	"minimum_items" integer DEFAULT 0,
	"applies_to" text DEFAULT 'all',
	"applicable_product_ids" uuid[] DEFAULT '{""}',
	"applicable_category_ids" uuid[] DEFAULT '{""}',
	"excluded_product_ids" uuid[] DEFAULT '{""}',
	"customer_type" text DEFAULT 'all',
	"allowed_customer_ids" uuid[] DEFAULT '{""}',
	"allowed_emails" text[] DEFAULT '{""}',
	"usage_limit" integer,
	"usage_limit_per_customer" integer DEFAULT 1,
	"times_used" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"starts_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"free_shipping" boolean DEFAULT false,
	"auto_apply" boolean DEFAULT false,
	"auto_apply_priority" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "discount_codes_code_key" UNIQUE("code"),
	CONSTRAINT "discount_codes_type_check" CHECK (type = ANY (ARRAY['percentage'::text, 'fixed'::text, 'free_shipping'::text])),
	CONSTRAINT "discount_codes_applies_to_check" CHECK (applies_to = ANY (ARRAY['all'::text, 'specific_products'::text, 'specific_categories'::text, 'specific_collections'::text])),
	CONSTRAINT "discount_codes_customer_type_check" CHECK (customer_type = ANY (ARRAY['all'::text, 'new'::text, 'returning'::text, 'specific'::text]))
);
--> statement-breakpoint
CREATE TABLE "shipping_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"countries" text[] DEFAULT '{""}',
	"provinces" text[] DEFAULT '{""}',
	"postal_codes" text[] DEFAULT '{""}',
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"base_cost" numeric(10, 2) DEFAULT '0',
	"cost_per_kg" numeric(10, 2),
	"min_weight" numeric(10, 3),
	"max_weight" numeric(10, 3),
	"free_shipping_threshold" numeric(10, 2),
	"min_delivery_days" integer,
	"max_delivery_days" integer,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "shipping_methods_type_check" CHECK (type = ANY (ARRAY['flat_rate'::text, 'free'::text, 'weight_based'::text, 'price_based'::text, 'item_based'::text, 'calculated'::text]))
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"rate" numeric(5, 4) NOT NULL,
	"country" text DEFAULT 'CA',
	"province" text,
	"type" text DEFAULT 'standard',
	"tax_class" text DEFAULT 'default',
	"is_compound" boolean DEFAULT false,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tax_rates_type_check" CHECK (type = ANY (ARRAY['standard'::text, 'reduced'::text, 'zero'::text, 'exempt'::text]))
);
--> statement-breakpoint
CREATE TABLE "inventory_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity_change" integer NOT NULL,
	"previous_quantity" integer NOT NULL,
	"new_quantity" integer NOT NULL,
	"reason" text NOT NULL,
	"notes" text,
	"order_id" uuid,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "inventory_logs_reason_check" CHECK (reason = ANY (ARRAY['sale'::text, 'return'::text, 'adjustment'::text, 'restock'::text, 'damaged'::text, 'theft'::text, 'count'::text, 'import'::text]))
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_highest_bidder_id_fkey" FOREIGN KEY ("highest_bidder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_watchers" ADD CONSTRAINT "auction_watchers_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_watchers" ADD CONSTRAINT "auction_watchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_subscriptions" ADD CONSTRAINT "email_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_methods" ADD CONSTRAINT "shipping_methods_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."shipping_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_active" ON "categories" USING btree ("is_active" bool_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "categories" USING btree ("parent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_categories_slug" ON "categories" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_products_active" ON "products" USING btree ("is_active" bool_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_products_created" ON "products" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_products_featured" ON "products" USING btree ("featured" bool_ops,"is_active" bool_ops) WHERE ((featured = true) AND (is_active = true));--> statement-breakpoint
CREATE INDEX "idx_products_gemstone" ON "products" USING btree ("gemstone_type" text_ops) WHERE (gemstone_type IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_products_inventory" ON "products" USING btree ("inventory" int4_ops) WHERE (inventory > 0);--> statement-breakpoint
CREATE INDEX "idx_products_price" ON "products" USING btree ("price" numeric_ops);--> statement-breakpoint
CREATE INDEX "idx_products_slug" ON "products" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_order" ON "payments" USING btree ("order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_provider_id" ON "payments" USING btree ("provider_payment_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_created" ON "orders" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_email" ON "orders" USING btree ("customer_email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_number" ON "orders" USING btree ("order_number" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_user" ON "orders" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_auctions_active" ON "auctions" USING btree ("is_active" bool_ops,"status" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_auctions_current_bid" ON "auctions" USING btree ("current_bid" numeric_ops);--> statement-breakpoint
CREATE INDEX "idx_auctions_end_time" ON "auctions" USING btree ("end_time" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_auctions_status" ON "auctions" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_bids_auction" ON "bids" USING btree ("auction_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_bids_user" ON "bids" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_product" ON "reviews" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_status" ON "reviews" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_wishlists_user" ON "wishlists" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_wishlist_items_wishlist" ON "wishlist_items" USING btree ("wishlist_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_carts_session" ON "carts" USING btree ("session_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_carts_user" ON "carts" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_cart_items_cart" ON "cart_items" USING btree ("cart_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("user_id" bool_ops,"is_read" bool_ops) WHERE (is_read = false);--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_contact_status" ON "contact_submissions" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_site_settings_key" ON "site_settings" USING btree ("key" text_ops);--> statement-breakpoint
CREATE INDEX "idx_discount_codes_code" ON "discount_codes" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_logs_product" ON "inventory_logs" USING btree ("product_id" uuid_ops);
*/