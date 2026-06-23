/**
 * Move FAQ, stats, and testimonial data from site_content JSON blobs
 * into proper faq, stats, and testimonials tables in Quickdash Neon.
 * Then delete the processed site_content rows.
 */

import pg from "pg";
const { Client } = pg;

const WORKSPACE_ID = "3410dcaf-29e1-40fa-8fbe-47a390f49ec5";
const TARGET_DB =
  "postgresql://neondb_owner:npg_3vpnZDEyz9Ke@ep-weathered-butterfly-ahelmvu4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const client = new Client({
    connectionString: TARGET_DB,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Quickdash Neon");

  // --- Move FAQ items ---
  console.log("\n--- FAQ ---");
  const { rows: faqRows } = await client.query(
    `SELECT id, key, value FROM site_content WHERE workspace_id = $1 AND type = 'faq'`,
    [WORKSPACE_ID]
  );
  console.log(`Found ${faqRows.length} FAQ entries in site_content`);

  let faqInserted = 0;
  for (const row of faqRows) {
    try {
      const data = JSON.parse(row.value);
      if (!DRY_RUN) {
        await client.query(
          `INSERT INTO faq (workspace_id, question, answer, category, sort_order, is_active, is_featured, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            data.question,
            data.answer,
            data.category || "general",
            data.sortOrder || 0,
            data.isActive !== false,
            data.isFeatured || false,
          ]
        );
      }
      faqInserted++;
      console.log(`  FAQ: "${data.question.slice(0, 50)}..."`);
    } catch (err) {
      console.error(`  Error processing FAQ ${row.key}: ${err.message}`);
    }
  }
  console.log(`Inserted ${faqInserted} FAQ items`);

  // --- Move Stats ---
  console.log("\n--- Stats ---");
  const { rows: statRows } = await client.query(
    `SELECT id, key, value FROM site_content WHERE workspace_id = $1 AND type = 'stat'`,
    [WORKSPACE_ID]
  );
  console.log(`Found ${statRows.length} stat entries in site_content`);

  let statsInserted = 0;
  for (const row of statRows) {
    try {
      const data = JSON.parse(row.value);
      if (!DRY_RUN) {
        await client.query(
          `INSERT INTO stats (workspace_id, title, value, description, icon, sort_order, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            data.title,
            data.value,
            data.description || null,
            data.icon || null,
            data.sortOrder || 0,
            data.isActive !== false,
          ]
        );
      }
      statsInserted++;
      console.log(`  Stat: "${data.title}" = ${data.value}`);
    } catch (err) {
      console.error(`  Error processing stat ${row.key}: ${err.message}`);
    }
  }
  console.log(`Inserted ${statsInserted} stats`);

  // --- Move Testimonials ---
  console.log("\n--- Testimonials ---");
  const { rows: testimonialRows } = await client.query(
    `SELECT id, key, value FROM site_content WHERE workspace_id = $1 AND type = 'testimonial'`,
    [WORKSPACE_ID]
  );
  console.log(`Found ${testimonialRows.length} testimonial entries in site_content`);

  let testimonialsInserted = 0;
  for (const row of testimonialRows) {
    try {
      const data = JSON.parse(row.value);
      if (!DRY_RUN) {
        await client.query(
          `INSERT INTO testimonials (workspace_id, reviewer_name, reviewer_email, rating, title, content, status, is_featured, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [
            WORKSPACE_ID,
            data.reviewerName,
            data.reviewerEmail || null,
            data.rating || 5,
            data.title || null,
            data.content,
            data.status || "approved",
            data.isFeatured || false,
          ]
        );
      }
      testimonialsInserted++;
      console.log(`  Testimonial: ${data.reviewerName} (${data.rating} stars)`);
    } catch (err) {
      console.error(`  Error processing testimonial ${row.key}: ${err.message}`);
    }
  }
  console.log(`Inserted ${testimonialsInserted} testimonials`);

  // --- Clean up site_content ---
  if (!DRY_RUN) {
    console.log("\n--- Cleaning up site_content ---");
    const { rowCount } = await client.query(
      `DELETE FROM site_content WHERE workspace_id = $1 AND type IN ('faq', 'stat', 'testimonial')`,
      [WORKSPACE_ID]
    );
    console.log(`Deleted ${rowCount} processed entries from site_content`);
  }

  // --- Summary ---
  console.log("\n=== Summary ===");
  console.log(`FAQ: ${faqInserted} items`);
  console.log(`Stats: ${statsInserted} items`);
  console.log(`Testimonials: ${testimonialsInserted} items`);
  if (DRY_RUN) console.log("(DRY RUN - no writes performed)");

  // Verify
  if (!DRY_RUN) {
    const { rows: faqCount } = await client.query("SELECT count(*) as c FROM faq WHERE workspace_id = $1", [WORKSPACE_ID]);
    const { rows: statsCount } = await client.query("SELECT count(*) as c FROM stats WHERE workspace_id = $1", [WORKSPACE_ID]);
    const { rows: testCount } = await client.query("SELECT count(*) as c FROM testimonials WHERE workspace_id = $1", [WORKSPACE_ID]);
    console.log(`\nVerification:`);
    console.log(`  faq table: ${faqCount[0].c} rows`);
    console.log(`  stats table: ${statsCount[0].c} rows`);
    console.log(`  testimonials table: ${testCount[0].c} rows`);
  }

  await client.end();
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
