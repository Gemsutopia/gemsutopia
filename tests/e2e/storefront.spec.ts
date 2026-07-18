import { expect, test } from '@playwright/test';

test('homepage exposes the primary storefront navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Gemsutopia/i);
  await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
});

test('shop remains usable on a mobile viewport', async ({ page }) => {
  await page.goto('/shop');

  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});
