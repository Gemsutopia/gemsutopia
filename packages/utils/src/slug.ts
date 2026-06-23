// Generate URL-safe slug from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Generate unique slug with optional suffix
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[],
  separator = '-'
): string {
  let slug = slugify(text);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${slugify(text)}${separator}${counter}`;
    counter++;
  }

  return slug;
}

// Parse slug back to readable text
export function unslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

// Check if string is a valid slug
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
