import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { products } = await store.products.list({ featured: true, limit: 20 });
    const featuredProducts = products.map(product => {
      const price = Number.parseFloat(product.price);
      const compareAtPrice = product.compareAtPrice
        ? Number.parseFloat(product.compareAtPrice)
        : price;

      return {
        id: product.id,
        product_id: product.slug || product.id,
        name: product.name,
        type: product.category?.name || '',
        description: product.shortDescription || product.description || '',
        image_url: product.thumbnail || product.images?.[0] || '/images/placeholder.jpg',
        price,
        original_price: compareAtPrice,
        sort_order: 0,
        inventory: product.stock?.reduce(
          (total, item) => total + Math.max(0, item.quantity),
          0
        ) ?? 0,
        is_active: true,
      };
    });

    return apiSuccess({ featuredProducts });
  } catch {
    return ApiError.externalService('QuickDash', 'Featured products are currently unavailable');
  }
}
