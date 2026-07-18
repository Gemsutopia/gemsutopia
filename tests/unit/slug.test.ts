import { describe, expect, it } from 'vitest';

import { generateUniqueSlug, isValidSlug, slugify, unslugify } from '../../packages/utils/src/slug';

describe('slug utilities', () => {
  it('normalizes storefront labels into URL-safe slugs', () => {
    expect(slugify('  Rare & Polished_Gems  ')).toBe('rare-polished-gems');
  });

  it('increments a duplicate slug without modifying the original label', () => {
    expect(generateUniqueSlug('Moonstone', ['moonstone', 'moonstone-1'])).toBe('moonstone-2');
  });

  it('validates and displays slugs', () => {
    expect(isValidSlug('new-arrivals')).toBe(true);
    expect(isValidSlug('New Arrivals')).toBe(false);
    expect(unslugify('new-arrivals')).toBe('New Arrivals');
  });
});
