/**
 * Migration Script: Gemsutopia Neon → Quickdash Neon
 *
 * Reads from local Docker Postgres (gemsutopia backup)
 * Transforms data to match Quickdash multi-tenant schema
 * Inserts into Quickdash Neon under workspace "gemsutopia"
 *
 * Usage:
 *   node scripts/migrate-to-quickdash.mjs [--dry-run]
 *
 * Requires:
 *   - Local Docker gemsutopia-db running (source)
 *   - Quickdash Neon accessible (target)
 */

import pg from "pg";
const { Client } = pg;

// ============================================================================
// CONFIG
// ============================================================================

const WORKSPACE_ID = "3410dcaf-29e1-40fa-8fbe-47a390f49ec5";
const OWNER_ID = "ysRb7dk5rGFwxFmrulMUjjw4PIaNQtr1"; // Quickdash user who owns the workspace

const SOURCE_DB = "postgresql://postgres:postgres@localhost:5432/gemsutopia";
const TARGET_DB =
  "postgresql://neondb_owner:npg_3vpnZDEyz9Ke@ep-weathered-butterfly-ahelmvu4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const DRY_RUN = process.argv.includes("--dry-run");

// ============================================================================
// HELPERS
// ============================================================================

/** Parse Postgres text[] array format into JS array */
function parsePgArray(val) {
  if (!val || val === "{}" || val === '{""}') return [];
  if (typeof val === "object" && Array.isArray(val)) return val;
  // Remove outer braces and split
  const inner = val.slice(1, -1);
  const result = [];
  let current = "";
  let inQuote = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '"' && inner[i - 1] !== "\\") {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) result.push(current);
  return result.filter((s) => s !== "");
}

/** Generate a URL-safe slug from a string */
function slugify(text) {
  if (!text) return `product-${Date.now()}`;
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, "") // Trim leading/trailing hyphens
    .slice(0, 200) || `product-${Date.now()}`;
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function logTable(name, inserted, skipped) {
  console.log(
    `  ${name}: ${inserted} inserted, ${skipped} skipped (duplicates)`
  );
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateProducts(source, target) {
  log("Migrating products...");
  const { rows } = await source.query("SELECT * FROM products");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    // Build metadata with gemstone fields and extra data
    const metadata = {
      ...(typeof row.metadata === "object" ? row.metadata : {}),
      // Gemstone-specific fields
      ...(row.gemstone_type && { gemstoneType: row.gemstone_type }),
      ...(row.carat_weight && { caratWeight: row.carat_weight }),
      ...(row.cut && { cut: row.cut }),
      ...(row.clarity && { clarity: row.clarity }),
      ...(row.color && { color: row.color }),
      ...(row.origin && { origin: row.origin }),
      ...(row.treatment && { treatment: row.treatment }),
      ...(row.certification && { certification: row.certification }),
      ...(row.certification_number && {
        certificationNumber: row.certification_number,
      }),
      ...(row.dimensions && { dimensions: row.dimensions }),
      ...(row.shape && { shape: row.shape }),
      // Inventory and tracking
      ...(row.inventory != null && { inventory: row.inventory }),
      ...(row.sku && { sku: row.sku }),
      ...(row.track_inventory != null && {
        trackInventory: row.track_inventory,
      }),
      ...(row.low_stock_threshold != null && {
        lowStockThreshold: row.low_stock_threshold,
      }),
      // Display options
      ...(row.video_url && { videoUrl: row.video_url }),
      ...(row.featured_image_index != null && {
        featuredImageIndex: row.featured_image_index,
      }),
      ...(row.on_sale != null && { onSale: row.on_sale }),
      // Stats
      ...(row.view_count && { viewCount: row.view_count }),
      ...(row.purchase_count && { purchaseCount: row.purchase_count }),
      ...(row.average_rating && { averageRating: row.average_rating }),
      ...(row.review_count && { reviewCount: row.review_count }),
      ...(row.sort_order && { sortOrder: row.sort_order }),
      ...(row.is_new != null && { isNew: row.is_new }),
      ...(row.is_bestseller != null && { isBestseller: row.is_bestseller }),
      // Source tracking
      migratedFrom: "gemsutopia",
      originalId: row.id,
    };

    // Parse images from Postgres array to JSON array
    const images = parsePgArray(row.images);

    // compare_at_price = original price when product is on sale
    const compareAtPrice = row.on_sale ? row.price : null;

    const tags = parsePgArray(row.tags);

    // Generate slug if missing - append short UUID suffix for uniqueness
    const slug = row.slug || slugify(row.name) + "-" + row.id.slice(0, 8);

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO products (id, workspace_id, name, slug, description, short_description, price, sale_price, compare_at_price, cost_price, category_id, images, tags, thumbnail, is_active, is_featured, weight, meta_title, meta_description, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
           ON CONFLICT (id) DO NOTHING`,
          [
            row.id,
            WORKSPACE_ID,
            row.name,
            slug,
            row.description,
            row.short_description,
            row.price,
            row.on_sale ? row.sale_price : null,
            compareAtPrice,
            row.cost_price,
            row.category_id,
            JSON.stringify(images),
            JSON.stringify(tags),
            images[0] || null, // thumbnail = first image
            row.is_active,
            row.featured,
            row.weight,
            row.meta_title,
            row.meta_description,
            row.created_at,
            row.updated_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++; // duplicate
      } else {
        console.error(`  Error inserting product ${row.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  logTable("products", inserted, skipped);
  return inserted;
}

async function migrateOrders(source, target) {
  log("Migrating orders...");
  const { rows } = await source.query("SELECT * FROM orders");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    // Store all gemsutopia-specific data in metadata
    const metadata = {
      ...(typeof row.metadata === "object" ? row.metadata : {}),
      // Customer info (since Quickdash uses user_id text reference)
      customerEmail: row.customer_email,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      // Addresses (Quickdash uses address IDs, we store inline)
      shippingAddress: {
        line1: row.shipping_address_line1,
        line2: row.shipping_address_line2,
        city: row.shipping_city,
        province: row.shipping_province,
        postalCode: row.shipping_postal_code,
        country: row.shipping_country,
      },
      billingAddress: row.billing_same_as_shipping
        ? null
        : {
            line1: row.billing_address_line1,
            line2: row.billing_address_line2,
            city: row.billing_city,
            province: row.billing_province,
            postalCode: row.billing_postal_code,
            country: row.billing_country,
          },
      billingSameAsShipping: row.billing_same_as_shipping,
      // Payment info
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      paymentDetails: row.payment_details,
      // Items (gemsutopia stores as JSONB, Quickdash uses order_items table)
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
      itemCount: row.item_count,
      // Shipping
      shippingMethod: row.shipping_method,
      carrier: row.carrier,
      carrierTrackingUrl: row.carrier_tracking_url,
      estimatedDelivery: row.estimated_delivery,
      // Extra
      currency: row.currency,
      discountCode: row.discount_code,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      adminNotes: row.admin_notes,
      // Source tracking
      migratedFrom: "gemsutopia",
      originalId: row.id,
    };

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO orders (id, workspace_id, order_number, user_id, status, subtotal, discount_amount, tax_amount, shipping_amount, total, tracking_number, tracking_url, shipped_at, delivered_at, customer_notes, internal_notes, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
           ON CONFLICT (id) DO NOTHING`,
          [
            row.id,
            WORKSPACE_ID,
            row.order_number,
            OWNER_ID, // user_id is NOT NULL in Quickdash - use workspace owner
            row.status || "pending",
            row.subtotal,
            row.discount_amount || "0",
            row.tax_amount || "0",
            row.shipping_cost || "0",
            row.total,
            row.tracking_number,
            row.carrier_tracking_url,
            row.shipped_at,
            row.delivered_at,
            row.customer_notes,
            row.admin_notes,
            JSON.stringify(metadata),
            row.created_at,
            row.updated_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(`  Error inserting order ${row.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  logTable("orders", inserted, skipped);
  return inserted;
}

async function migrateAuctions(source, target) {
  log("Migrating auctions...");
  const { rows } = await source.query("SELECT * FROM auctions");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const images = parsePgArray(row.images);
    const hasReserve = row.reserve_price != null;

    // Store extra gemsutopia fields in metadata
    const metadata = {
      ...(typeof row.metadata === "object" ? row.metadata : {}),
      // Gemstone fields
      ...(row.gemstone_type && { gemstoneType: row.gemstone_type }),
      ...(row.carat_weight && { caratWeight: row.carat_weight }),
      ...(row.cut && { cut: row.cut }),
      ...(row.clarity && { clarity: row.clarity }),
      ...(row.color && { color: row.color }),
      ...(row.origin && { origin: row.origin }),
      ...(row.certification && { certification: row.certification }),
      // Auction-specific fields not in Quickdash schema
      ...(row.buy_now_price && { buyNowPrice: row.buy_now_price }),
      ...(row.currency && { currency: row.currency }),
      ...(row.extended_end_time && { extendedEndTime: row.extended_end_time }),
      ...(row.extend_minutes && { extendMinutes: row.extend_minutes }),
      ...(row.extend_threshold_minutes && {
        extendThresholdMinutes: row.extend_threshold_minutes,
      }),
      ...(row.featured_image_index != null && {
        featuredImageIndex: row.featured_image_index,
      }),
      ...(row.video_url && { videoUrl: row.video_url }),
      ...(row.meta_title && { metaTitle: row.meta_title }),
      ...(row.meta_description && { metaDescription: row.meta_description }),
      // Source tracking
      migratedFrom: "gemsutopia",
      originalId: row.id,
    };

    // Map status: gemsutopia statuses → Quickdash statuses
    // Quickdash: draft, scheduled, active, ended, sold, unsold, cancelled
    // Gemsutopia: pending, scheduled, active, ended, sold, cancelled, no_sale
    let status = row.status;
    if (status === "pending") status = "draft";
    if (status === "no_sale") status = "unsold";

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO auctions (id, workspace_id, product_id, title, description, images, type, starting_price, reserve_price, minimum_increment, current_bid, bid_count, status, starts_at, ends_at, auto_extend, auto_extend_minutes, winning_bid, reserve_met, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
           ON CONFLICT (id) DO NOTHING`,
          [
            row.id,
            WORKSPACE_ID,
            row.product_id,
            row.title,
            row.description,
            JSON.stringify(images),
            hasReserve ? "reserve" : "no_reserve",
            row.starting_bid,
            row.reserve_price,
            row.bid_increment || "1.00",
            row.current_bid,
            row.bid_count || 0,
            status,
            row.start_time,
            row.end_time,
            row.auto_extend,
            row.extend_minutes || 5,
            row.winning_bid,
            hasReserve
              ? parseFloat(row.current_bid || "0") >=
                parseFloat(row.reserve_price || "0")
              : null,
            JSON.stringify(metadata),
            row.created_at,
            row.updated_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(`  Error inserting auction ${row.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  logTable("auctions", inserted, skipped);
  return inserted;
}

async function migrateReviews(source, target) {
  log("Migrating reviews → site_content (testimonials)...");
  // Gemsutopia reviews have NULL product_id and user_id
  // Quickdash reviews require both NOT NULL
  // These are store-wide testimonials, so store in site_content
  const { rows } = await source.query("SELECT * FROM reviews");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const key = `testimonial:${row.id}`;
    const value = JSON.stringify({
      reviewerName: row.reviewer_name,
      reviewerEmail: row.reviewer_email,
      rating: row.rating,
      title: row.title,
      content: row.content,
      images: parsePgArray(row.images),
      verifiedPurchase: row.verified_purchase,
      status: row.status,
      isFeatured: row.is_featured,
      adminResponse: row.admin_response,
      helpfulCount: row.helpful_count,
      notHelpfulCount: row.not_helpful_count,
      createdAt: row.created_at,
    });

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO site_content (workspace_id, key, type, value, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT DO NOTHING`,
          [WORKSPACE_ID, key, "testimonial", value]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(`  Error inserting review ${row.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  logTable("reviews → site_content", inserted, skipped);
  return inserted;
}

async function migrateSiteContent(source, target) {
  log("Migrating site_content...");
  const { rows } = await source.query("SELECT * FROM site_content");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    // Quickdash site_content: workspace_id, key, type, value, updated_by, updated_at
    // Gemsutopia: section, key, value, content_type
    // Combine section:key as the key
    const key = `${row.section}:${row.key}`;

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO site_content (workspace_id, key, type, value, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            key,
            row.content_type || "text",
            row.value,
            row.updated_at || row.created_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(
          `  Error inserting site_content ${row.id}: ${err.message}`
        );
        skipped++;
      }
    }
  }

  logTable("site_content", inserted, skipped);
  return inserted;
}

async function migrateSiteSettings(source, target) {
  log("Migrating site_settings → store_settings...");
  const { rows } = await source.query("SELECT * FROM site_settings");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    // Quickdash store_settings: workspace_id, key, value (text), group, updated_by, updated_at
    // Gemsutopia: key, value (jsonb), type, category
    const value =
      typeof row.value === "object"
        ? JSON.stringify(row.value)
        : String(row.value || "");

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO store_settings (workspace_id, key, value, "group", updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            row.key,
            value,
            row.category || "general",
            row.updated_at || row.created_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(
          `  Error inserting site_setting ${row.id}: ${err.message}`
        );
        skipped++;
      }
    }
  }

  logTable("site_settings → store_settings", inserted, skipped);
  return inserted;
}

async function migrateGemFacts(source, target) {
  log("Migrating gem_facts → site_content...");
  const { rows } = await source.query("SELECT * FROM gem_facts");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const key = `gem_fact:${row.id}`;
    const value = JSON.stringify({
      title: row.title,
      content: row.content,
      shortContent: row.short_content,
      image: row.image,
      videoUrl: row.video_url,
      gemstoneType: row.gemstone_type,
      category: row.category,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      source: row.source,
      sourceUrl: row.source_url,
    });

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO site_content (workspace_id, key, type, value, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            key,
            "gem_fact",
            value,
            row.updated_at || row.created_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(`  Error inserting gem_fact ${row.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  logTable("gem_facts → site_content", inserted, skipped);
  return inserted;
}

async function migrateFaq(source, target) {
  log("Migrating faq → site_content...");
  const { rows } = await source.query("SELECT * FROM faq");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const key = `faq:${row.id}`;
    const value = JSON.stringify({
      question: row.question,
      answer: row.answer,
      category: row.category,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      viewCount: row.view_count,
      helpfulCount: row.helpful_count,
      notHelpfulCount: row.not_helpful_count,
    });

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO site_content (workspace_id, key, type, value, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            key,
            "faq",
            value,
            row.updated_at || row.created_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(`  Error inserting faq ${row.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  logTable("faq → site_content", inserted, skipped);
  return inserted;
}

async function migrateStats(source, target) {
  log("Migrating stats → site_content...");
  const { rows } = await source.query("SELECT * FROM stats");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const key = `stat:${row.id}`;
    const value = JSON.stringify({
      title: row.title,
      value: row.value,
      description: row.description,
      icon: row.icon,
      dataSource: row.data_source,
      isRealTime: row.is_real_time,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    });

    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO site_content (workspace_id, key, type, value, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            key,
            "stat",
            value,
            row.updated_at || row.created_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(`  Error inserting stat ${row.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  logTable("stats → site_content", inserted, skipped);
  return inserted;
}

async function migrateDiscountCodes(source, target) {
  log("Migrating discount_codes → discounts...");
  const { rows } = await source.query("SELECT * FROM discount_codes");
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    // Quickdash discounts: workspace_id, name, code, discount_type, value_type, value,
    //   minimum_order_amount, max_uses, current_uses, max_uses_per_user,
    //   applicable_categories, is_active, is_stackable, starts_at, expires_at
    try {
      if (!DRY_RUN) {
        await target.query(
          `INSERT INTO discounts (workspace_id, name, code, discount_type, value_type, value, minimum_order_amount, max_uses, current_uses, max_uses_per_user, is_active, starts_at, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            row.description || row.code,
            row.code,
            "order", // discount applies to whole order
            row.type, // percentage, fixed, free_shipping
            row.value,
            row.minimum_order_amount || "0",
            row.usage_limit,
            row.times_used || 0,
            row.usage_limit_per_customer || 1,
            row.is_active,
            row.starts_at,
            row.expires_at,
          ]
        );
      }
      inserted++;
    } catch (err) {
      if (err.code === "23505") {
        skipped++;
      } else {
        console.error(
          `  Error inserting discount ${row.id}: ${err.message}`
        );
        skipped++;
      }
    }
  }

  logTable("discount_codes → discounts", inserted, skipped);
  return inserted;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("  Gemsutopia → Quickdash Migration");
  console.log(`  Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`  Workspace: ${WORKSPACE_ID}`);
  console.log("=".repeat(60));
  console.log();

  const source = new Client({ connectionString: SOURCE_DB });
  const target = new Client({
    connectionString: TARGET_DB,
    ssl: { rejectUnauthorized: false },
  });

  try {
    log("Connecting to source (local Docker)...");
    await source.connect();
    log("Connected to source.");

    log("Connecting to target (Quickdash Neon)...");
    await target.connect();
    log("Connected to target.");

    // Verify source has data
    const { rows: sourceCheck } = await source.query(
      "SELECT count(*) as c FROM products"
    );
    log(`Source products: ${sourceCheck[0].c}`);

    // Verify target workspace exists
    const { rows: wsCheck } = await target.query(
      "SELECT id, name FROM workspaces WHERE id = $1",
      [WORKSPACE_ID]
    );
    if (wsCheck.length === 0) {
      throw new Error(`Workspace ${WORKSPACE_ID} not found in target!`);
    }
    log(`Target workspace: ${wsCheck[0].name} (${wsCheck[0].id})`);

    console.log();
    log("Starting migration...");
    console.log("-".repeat(60));

    const results = {};

    // Migrate in dependency order (products before orders/auctions)
    results.products = await migrateProducts(source, target);
    results.orders = await migrateOrders(source, target);
    results.auctions = await migrateAuctions(source, target);
    results.reviews = await migrateReviews(source, target);
    results.siteContent = await migrateSiteContent(source, target);
    results.siteSettings = await migrateSiteSettings(source, target);
    results.gemFacts = await migrateGemFacts(source, target);
    results.faq = await migrateFaq(source, target);
    results.stats = await migrateStats(source, target);
    results.discountCodes = await migrateDiscountCodes(source, target);

    console.log("-".repeat(60));
    console.log();
    log("Migration complete!");
    console.log();

    // Summary
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    console.log(`Total records migrated: ${total}`);
    console.log();

    if (DRY_RUN) {
      console.log(
        "This was a DRY RUN. No data was written. Run without --dry-run to execute."
      );
    }
  } catch (err) {
    console.error(`\nFATAL ERROR: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await source.end();
    await target.end();
  }
}

main();
