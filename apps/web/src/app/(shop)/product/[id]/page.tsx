import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductContent from './ProductContent';
import { notFound } from 'next/navigation';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Fetch from Quickdash Storefront API (supports both ID and slug)
    const { product: quickdashProduct } = await store.products.get(id);

    // Map to local format expected by ProductContent
    const product = {
      id: quickdashProduct.id,
      name: quickdashProduct.name,
      description: quickdashProduct.description || '',
      price: parseFloat(quickdashProduct.price),
      salePrice: quickdashProduct.compareAtPrice ? parseFloat(quickdashProduct.compareAtPrice) : undefined,
      onSale: !!quickdashProduct.compareAtPrice && parseFloat(quickdashProduct.compareAtPrice) > parseFloat(quickdashProduct.price),
      images: quickdashProduct.images || [],
      inventory: 99, // TODO: Get from stock when available
      sku: (quickdashProduct as any).sku || `SKU-${quickdashProduct.id.slice(0, 8)}`,
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
    notFound();
  }
}
