import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

// =============================================================================
// Quickdash Neon Schema (workspace-scoped)
// Only tables the gemsutopia frontend queries directly.
// Products, categories, auctions, orders etc. are handled via Quickdash Storefront API.
// =============================================================================

export const siteContent = pgTable(
  'site_content',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id'),
    key: text('key').notNull(),
    type: text('type').notNull().default('text'),
    value: text('value'),
    updatedBy: text('updated_by'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('site_content_workspace_idx').on(table.workspaceId)]
);

export const faq = pgTable(
  'faq',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    category: text('category').default('general'),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    isFeatured: boolean('is_featured').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('faq_workspace_idx').on(table.workspaceId)]
);

export const stats = pgTable(
  'stats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull(),
    title: text('title').notNull(),
    value: text('value').notNull(),
    description: text('description'),
    icon: text('icon'),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('stats_workspace_idx').on(table.workspaceId)]
);

export const testimonials = pgTable(
  'testimonials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull(),
    reviewerName: text('reviewer_name').notNull(),
    reviewerEmail: text('reviewer_email'),
    rating: integer('rating').notNull(),
    title: text('title'),
    content: text('content').notNull(),
    status: text('status').notNull().default('pending'),
    isFeatured: boolean('is_featured').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('testimonials_workspace_idx').on(table.workspaceId)]
);

export const storeSettings = pgTable(
  'store_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id'),
    key: text('key').notNull(),
    value: text('value'),
    group: text('group').notNull().default('general'),
    updatedBy: text('updated_by'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('store_settings_workspace_idx').on(table.workspaceId)]
);
