/**
 * 1. Re-insert FAQ, stats, testimonials from local Docker backup into Quickdash site_content
 * 2. Move them from site_content into proper tables
 * 3. Delete the site_content blobs
 */

import pg from "pg";
const { Client } = pg;

const WORKSPACE_ID = "3410dcaf-29e1-40fa-8fbe-47a390f49ec5";
const SOURCE_DB = "postgresql://postgres:postgres@localhost:5432/gemsutopia";
const TARGET_DB =
  "postgresql://neondb_owner:npg_3vpnZDEyz9Ke@ep-weathered-butterfly-ahelmvu4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

function parsePgArray(val) {
  if (!val || val === "{}" || val === '{""}') return [];
  if (typeof val === "object" && Array.isArray(val)) return val;
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

async function main() {
  const source = new Client({ connectionString: SOURCE_DB });
  const target = new Client({
    connectionString: TARGET_DB,
    ssl: { rejectUnauthorized: false },
  });

  await source.connect();
  await target.connect();
  console.log("Connected to both databases");

  // --- Insert FAQ directly into faq table ---
  console.log("\n--- FAQ ---");
  const { rows: faqRows } = await source.query("SELECT * FROM faq WHERE is_active = true");
  console.log(`Source: ${faqRows.length} active FAQ items`);

  for (const row of faqRows) {
    await target.query(
      `INSERT INTO faq (workspace_id, question, answer, category, sort_order, is_active, is_featured, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING`,
      [
        WORKSPACE_ID,
        row.question,
        row.answer,
        row.category || "general",
        row.sort_order || 0,
        row.is_active,
        row.is_featured || false,
        row.created_at,
        row.updated_at,
      ]
    );
    console.log(`  FAQ: "${row.question.slice(0, 50)}..."`);
  }

  // --- Insert Stats directly into stats table ---
  console.log("\n--- Stats ---");
  const { rows: statRows } = await source.query("SELECT * FROM stats WHERE is_active = true");
  console.log(`Source: ${statRows.length} active stats`);

  for (const row of statRows) {
    await target.query(
      `INSERT INTO stats (workspace_id, title, value, description, icon, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING`,
      [
        WORKSPACE_ID,
        row.title,
        row.value,
        row.description,
        row.icon,
        row.sort_order || 0,
        row.is_active,
        row.created_at,
        row.updated_at,
      ]
    );
    console.log(`  Stat: "${row.title}" = ${row.value}`);
  }

  // --- Insert Reviews/Testimonials directly into testimonials table ---
  console.log("\n--- Testimonials ---");
  const { rows: reviewRows } = await source.query("SELECT * FROM reviews");
  console.log(`Source: ${reviewRows.length} reviews`);

  for (const row of reviewRows) {
    await target.query(
      `INSERT INTO testimonials (workspace_id, reviewer_name, reviewer_email, rating, title, content, status, is_featured, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT DO NOTHING`,
      [
        WORKSPACE_ID,
        row.reviewer_name,
        row.reviewer_email,
        row.rating,
        row.title,
        row.content,
        row.status || "approved",
        row.is_featured || false,
        row.created_at,
        row.updated_at,
      ]
    );
    console.log(`  Testimonial: ${row.reviewer_name} (${row.rating} stars, ${row.status})`);
  }

  // --- Verify ---
  const { rows: faqCount } = await target.query("SELECT count(*) as c FROM faq WHERE workspace_id = $1", [WORKSPACE_ID]);
  const { rows: statsCount } = await target.query("SELECT count(*) as c FROM stats WHERE workspace_id = $1", [WORKSPACE_ID]);
  const { rows: testCount } = await target.query("SELECT count(*) as c FROM testimonials WHERE workspace_id = $1", [WORKSPACE_ID]);

  console.log(`\n=== Verification ===`);
  console.log(`  faq: ${faqCount[0].c} rows`);
  console.log(`  stats: ${statsCount[0].c} rows`);
  console.log(`  testimonials: ${testCount[0].c} rows`);

  await source.end();
  await target.end();
}

main().catch(err => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
