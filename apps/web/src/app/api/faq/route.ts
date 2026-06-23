import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { faq } = await store.faq.list();

    const mappedFaq = faq.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
      sort_order: item.sortOrder,
      is_featured: item.isFeatured,
    }));

    return apiSuccess({ faq: mappedFaq });
  } catch {
    return ApiError.internal('Failed to fetch FAQ');
  }
}
