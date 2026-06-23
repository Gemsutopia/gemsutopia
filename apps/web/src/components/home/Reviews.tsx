'use client';
import { useState, useEffect, useRef } from 'react';
import { IconStar, IconMail, IconTextCaption } from '@tabler/icons-react';
import '../../styles/reviews.css';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title?: string;
  content: string;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
}

export default function Reviews() {
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);
  const [reviews, setReviews] = useState<Review[]>([]);
  // Animation logic for smooth infinite scroll
  useEffect(() => {
    if (!isClient || reviews.length <= 4 || !containerRef.current) return;

    let animationId: number;
    const startTime = performance.now();
    const container = containerRef.current;

    // Calculate dimensions
    const cardWidth = 352; // w-80 (320px) + mx-4 (32px margin) = 352px total width per card
    const oneSetWidth = reviews.length * cardWidth;

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const speed = 45; // pixels per second - faster but still smooth
      const translateX = -(elapsed * speed);

      // Better normalization to prevent glitches
      let normalizedTranslateX = 0;
      if (oneSetWidth > 0) {
        const rawMod = translateX % oneSetWidth;
        normalizedTranslateX = rawMod <= -oneSetWidth ? rawMod + oneSetWidth : rawMod;
      }

      // Directly update the transform without causing React re-renders
      container.style.transform = `translate3d(${normalizedTranslateX}px, 0, 0)`;

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isClient, reviews]);

  // Fetch reviews from database
  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      if (data.success && data.reviews) {
        // Only show approved reviews
        const approvedReviews = data.reviews.filter((review: Review) => review.is_approved);
        setReviews(approvedReviews);
      }
    } catch {
      // Fallback to empty array if fetch fails
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Fallback reviews removed - only showing real reviews

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    review: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('Thank you for your review!');
        setReviewForm({
          name: '',
          email: '',
          rating: 5,
          title: '',
          review: '',
        });
        // Refresh reviews to show the new one if it was auto-approved
        fetchReviews();
        // Close modal after successful submission
        setTimeout(() => {
          setShowModal(false);
          setSubmitMessage('');
        }, 2000);
      } else {
        setSubmitMessage('Failed to submit review. Please try again.');
      }
    } catch {
      setSubmitMessage('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative z-10 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Reviews From Our Friends!
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white">
            See what our customers are saying about our authentic gemstone collection
          </p>
        </div>
      </div>

      {/* Reviews Display */}
      <div className="py-12">
        {(() => {
          const displayReviews = reviews; // Only show real reviews from database
          const shouldCenter = displayReviews.length <= 4;

          if (shouldCenter) {
            // Centered layout for 4 or fewer items
            return (
              <div className="mx-auto flex max-w-6xl flex-wrap items-stretch justify-center gap-4 px-4 py-8">
                {displayReviews.map((review, index) => {
                  const displayName = review.customer_name;
                  const displayContent = review.content;
                  const isVerified = review.is_approved;

                  return (
                    <div key={index} className="w-80 flex-shrink-0">
                      <div className="flex h-[140px] flex-col rounded-2xl bg-black/80 p-4 backdrop-blur-md">
                        <div className="mb-3 flex items-center">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                            <span className="text-sm font-semibold text-black">
                              {displayName[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-semibold text-white">{displayName}</h3>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <span key={i} className="text-sm text-yellow-400">
                                  ★
                                </span>
                              ))}
                              {isVerified && (
                                <span className="ml-2 text-xs font-medium text-green-400">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="flex-grow overflow-hidden text-xs leading-relaxed text-white/80">
                          {displayContent}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            // Scrolling layout for more than 4 items
            return (
              <div className="overflow-hidden py-8">
                <div ref={containerRef} className="reviews-carousel flex">
                  {displayReviews
                    .concat(displayReviews)
                    .concat(displayReviews)
                    .map((review, index) => {
                      const displayName = review.customer_name;
                      const displayContent = review.content;
                      const isVerified = review.is_approved;

                      return (
                        <div key={index} className="mx-4 inline-block w-80 flex-shrink-0">
                          <div className="flex h-[140px] flex-col rounded-2xl bg-black/80 p-4 backdrop-blur-md">
                            <div className="mb-3 flex items-center">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                                <span className="text-sm font-semibold text-black">
                                  {displayName[0]}
                                </span>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-semibold text-white">{displayName}</h3>
                                <div className="flex items-center">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <span key={i} className="text-sm text-yellow-400">
                                      ★
                                    </span>
                                  ))}
                                  {isVerified && (
                                    <span className="ml-2 text-xs font-medium text-green-400">
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="flex-grow overflow-hidden text-xs leading-relaxed text-white/80">
                              {displayContent}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          }
        })()}
      </div>

      {/* Leave a Review Section */}
      <div className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="mb-6 text-3xl font-bold text-white md:text-4xl">Leave a Review!</h3>

          {/* 5 Stars */}
          <div className="mb-8 flex justify-center">
            {[...Array(5)].map((_, i) => (
              <IconStar key={i} size={32} className="mx-1 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          {/* Review Button */}
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-black/80 px-8 py-3 text-lg font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
          >
            Review
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="review-modal fixed inset-0 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-2xl font-bold text-black">Share Your Experience</h3>
              <p className="text-sm text-gray-600">
                Your feedback helps us grow and helps other customers make informed decisions.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            {submitMessage && (
              <div
                className={`mb-4 rounded-lg p-3 text-center text-sm ${
                  submitMessage.includes('Thank you')
                    ? 'border border-green-300 bg-green-100 text-green-800'
                    : 'border border-red-300 bg-red-100 text-red-800'
                }`}
              >
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-center text-sm font-medium text-black">
                  Rating
                </label>
                <div className="mb-2 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className={`rounded p-1 transition-colors ${
                        star <= reviewForm.rating
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <IconStar
                        size={24}
                        className={star <= reviewForm.rating ? 'fill-current' : ''}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-500">
                  {reviewForm.rating === 0
                    ? 'Please select a rating'
                    : reviewForm.rating === 1
                      ? 'Poor'
                      : reviewForm.rating === 2
                        ? 'Fair'
                        : reviewForm.rating === 3
                          ? 'Good'
                          : reviewForm.rating === 4
                            ? 'Very Good'
                            : 'Excellent'}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                  placeholder="Give your review a title..."
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {reviewForm.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">Your Review</label>
                <textarea
                  value={reviewForm.review}
                  onChange={e => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                  placeholder="Share your experience with Gemsutopia..."
                  maxLength={500}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {reviewForm.review.length}/500 characters
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block flex items-center gap-1 text-sm font-medium text-black">
                    <IconTextCaption size={16} />
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    placeholder="Enter your name"
                    maxLength={50}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block flex items-center gap-1 text-sm font-medium text-black">
                    <IconMail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={reviewForm.email}
                    onChange={e => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
