import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const revalidate = 300;

export async function POST(request: NextRequest) {
  try {
    const { name, email, rating, title, review } = await request.json();

    if (!name || !email || !rating || !review) {
      return ApiError.validation('Name, email, rating, and review are required');
    }

    if (rating < 1 || rating > 5) {
      return ApiError.validation('Rating must be between 1 and 5');
    }

    if (name.length > 50) {
      return ApiError.validation('Name must be 50 characters or less');
    }

    if (title && title.length > 100) {
      return ApiError.validation('Title must be 100 characters or less');
    }

    if (review.length > 500) {
      return ApiError.validation('Review must be 500 characters or less');
    }

    // Submit via Storefront API (collections.submit handles workspace scoping)
    const result = await store.collections.submit('testimonials', {
      reviewerName: name,
      reviewerEmail: email,
      rating: parseInt(rating),
      title: title || null,
      content: review,
      status: 'pending',
      isFeatured: false,
    });

    return apiSuccess({ review: result.entry }, 'Review submitted successfully', 201);
  } catch {
    return ApiError.internal('Failed to submit review');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';

    const { testimonials: allTestimonials } = await store.testimonials.list({ featured });

    const reviews = allTestimonials.map(t => ({
      id: t.id,
      reviewerName: t.reviewerName,
      content: t.content,
      rating: t.rating,
      title: t.title,
      isFeatured: t.isFeatured,
    }));

    return NextResponse.json(
      { success: true, data: { reviews, count: reviews.length } },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch {
    return ApiError.internal('Failed to fetch reviews');
  }
}
