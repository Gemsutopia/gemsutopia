import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductContent from './ProductContent';
import { notFound } from 'next/navigation';
import { store } from '@/lib/store';
import { StorefrontError } from '@/lib/storefront-client';

export const dynamic = 'force-dynamic';

function getPrimaryVariant(product: Awaited<ReturnType<typeof store.products.get>>['product']) {
  return product.variants?.[0] || null;
}

function getVariantStock(
  product: Awaited<ReturnType<typeof store.products.get>>['product'],
  variantId?: string
) {
  if (!product.stock?.length) return 0;
  if (!variantId) {
    return product.stock.reduce((total, item) => total + Math.max(0, item.quantity), 0);
  }
  return Math.max(0, product.stock.find(item => item.variantId === variantId)?.quantity ?? 0);
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Fetch from Quickdash Storefront API (supports both ID and slug)
    const { product: quickdashProduct } = await store.products.get(id);
    const productImages = [
      quickdashProduct.thumbnail,
      ...(quickdashProduct.images || []),
    ].filter((image, index, images): image is string =>
      Boolean(image) && images.indexOf(image) === index
    );
    const primaryVariant = getPrimaryVariant(quickdashProduct);
    const inventory = getVariantStock(quickdashProduct, primaryVariant?.id);
    const currentPrice = parseFloat(primaryVariant?.price || quickdashProduct.price);
    const compareAtPrice = quickdashProduct.compareAtPrice
      ? parseFloat(quickdashProduct.compareAtPrice)
      : null;
    const isOnSale = compareAtPrice !== null && compareAtPrice > currentPrice;

    // Map to local format expected by ProductContent
    const product = {
      id: quickdashProduct.id,
      variantId: primaryVariant?.id,
      name: quickdashProduct.name,
      description: quickdashProduct.description || '',
      price: isOnSale ? compareAtPrice : currentPrice,
      salePrice: isOnSale ? currentPrice : undefined,
      onSale: isOnSale,
      images: productImages,
      inventory,
      sku: primaryVariant?.sku || `SKU-${quickdashProduct.id.slice(0, 8)}`,
      category: quickdashProduct.category,
      // Gemstone specs from metadata (if stored there)
      ...(quickdashProduct as any).metadata,
    };

    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <div className="relative z-10">
          <ProductContent product={product} />
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch product:', error);
    if (error instanceof StorefrontError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
