/**
 * Seed script to add a test product for payment testing
 * Run with: DATABASE_URL="your-url" pnpm tsx packages/database/seed-test-product.ts
 * Or load .env first: source .env.local && pnpm tsx packages/database/seed-test-product.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { randomUUID } from 'crypto';
import * as schema from './src/schema';

async function seedTestProduct() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL environment variable is not set');
    console.log('Please create a .env file with DATABASE_URL or run from apps/web directory');
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  console.log('Seeding test product...');

  // First, check if we have a test category, if not create one
  const existingCategories = await db.query.categories.findMany({
    limit: 1,
  });

  let categoryId: string;

  if (existingCategories.length === 0) {
    // Create a test category
    const newCategory = {
      id: randomUUID(),
      name: 'Gemstones',
      slug: 'gemstones',
      description: 'Beautiful gemstones from around the world',
      isActive: true,
      isFeatured: true,
    };

    await db.insert(schema.categories).values(newCategory);
    categoryId = newCategory.id;
    console.log('Created test category: Gemstones');
  } else {
    categoryId = existingCategories[0].id;
    console.log(`Using existing category: ${existingCategories[0].name}`);
  }

  // Check if test product already exists
  const existingProduct = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.slug, 'test-sapphire'),
  });

  if (existingProduct) {
    console.log('Test product already exists!');
    console.log(`Product: ${existingProduct.name}`);
    console.log(`Price: $${existingProduct.price}`);
    console.log(`Slug: ${existingProduct.slug}`);
    console.log(`URL: /product/${existingProduct.id}`);
    return;
  }

  // Create the test product
  const testProduct = {
    id: randomUUID(),
    name: 'Test Blue Sapphire',
    slug: 'test-sapphire',
    description: `
      <p>This is a <strong>test product</strong> for payment flow testing.</p>
      <p>A stunning blue sapphire with exceptional clarity and color saturation.
      This gemstone showcases the classic cornflower blue hue that sapphires are famous for.</p>
      <h3>Features:</h3>
      <ul>
        <li>Natural, untreated stone</li>
        <li>Excellent clarity</li>
        <li>Eye-clean with no visible inclusions</li>
        <li>Certified authentic</li>
      </ul>
      <p><em>Note: This is a test product for payment testing purposes.</em></p>
    `,
    shortDescription: 'A beautiful test blue sapphire for payment flow testing.',
    price: '99.99',
    salePrice: '79.99',
    onSale: true,
    costPrice: '50.00',
    inventory: 10,
    sku: 'TEST-SAPPHIRE-001',
    trackInventory: true,
    lowStockThreshold: 2,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    ],
    featuredImageIndex: 0,
    categoryId: categoryId,
    gemstoneType: 'Sapphire',
    caratWeight: '2.50',
    cut: 'Oval',
    clarity: 'VS',
    color: 'Blue',
    origin: 'Sri Lanka',
    treatment: 'None',
    certification: 'GIA',
    certificationNumber: 'TEST-12345678',
    isActive: true,
    featured: true,
    isNew: true,
    isBestseller: false,
    metaTitle: 'Test Blue Sapphire | Gemsutopia',
    metaDescription: 'A test product for payment flow testing. Beautiful blue sapphire.',
  };

  await db.insert(schema.products).values(testProduct);

  console.log('\n✅ Test product created successfully!');
  console.log('=====================================');
  console.log(`Name: ${testProduct.name}`);
  console.log(`Price: $${testProduct.price} (Sale: $${testProduct.salePrice})`);
  console.log(`Inventory: ${testProduct.inventory}`);
  console.log(`SKU: ${testProduct.sku}`);
  console.log('=====================================');
  console.log(`\nView at: /product/${testProduct.id}`);
  console.log(`Or: /shop (it should appear in the product grid)`);
}

seedTestProduct()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding test product:', error);
    process.exit(1);
  });
