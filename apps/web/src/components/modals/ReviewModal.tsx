'use client';

import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { Rating, Star } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
}

// Custom star styles for the rating component
const customStarStyles = {
  itemShapes: Star,
  activeFillColor: '#facc15',
  inactiveFillColor: 'rgba(255, 255, 255, 0.3)',
};

export default function ReviewModal({ isOpen, onClose, productId }: ReviewModalProps) {
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    review: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Lock body scroll when modal is open (preserve scroll position)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
        body: JSON.stringify({ ...reviewForm, productId }),
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
        setTimeout(() => {
          onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-black p-5 shadow-2xl sm:p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 transition-colors hover:text-white sm:top-4 sm:right-4"
          aria-label="Close modal"
        >
          <IconX size={20} />
        </button>

        {/* Header */}
        <div className="mb-4 text-center sm:mb-6">
          <h3 className="mb-1 font-[family-name:var(--font-cormorant)] text-2xl text-white sm:mb-2 sm:text-3xl">
            Share Your Experience
          </h3>
          <p className="text-xs text-white/60 sm:text-sm">
            We&apos;d love to hear about your experience with us!
          </p>
        </div>

        {submitMessage && (
          <div
            className={`mb-3 rounded-lg p-2 text-center text-xs sm:mb-4 sm:p-3 sm:text-sm ${
              submitMessage.includes('Thank you')
                ? 'border border-green-500/30 bg-green-500/10 text-green-400'
                : 'border border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-5">
          {/* Rating */}
          <div className="flex flex-col items-center">
            <Rating
              style={{ maxWidth: 200 }}
              value={reviewForm.rating}
              onChange={(value: number) => setReviewForm((prev) => ({ ...prev, rating: value }))}
              itemStyles={customStarStyles}
              halfFillMode="svg"
            />
            <p className="mt-1 text-center text-xs text-white/40">
              {reviewForm.rating} {reviewForm.rating === 1 ? 'star' : 'stars'}
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-white/70 sm:text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={reviewForm.email}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              required
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 sm:px-4 sm:py-3"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs text-white/70 sm:text-sm">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={reviewForm.name}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
              maxLength={50}
              required
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 sm:px-4 sm:py-3"
            />
          </div>

          {/* Review Title */}
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-xs text-white/70 sm:text-sm">
              Review Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={reviewForm.title}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Give your review a title..."
              maxLength={100}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 sm:px-4 sm:py-3"
            />
          </div>

          {/* Review Content */}
          <div className="flex flex-col gap-1">
            <label htmlFor="review" className="text-xs text-white/70 sm:text-sm">
              Your Review
            </label>
            <Textarea
              id="review"
              value={reviewForm.review}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, review: e.target.value }))}
              placeholder="Share your experience with Gemsutopia..."
              maxLength={500}
              required
              className="min-h-[80px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-none outline-none transition-colors focus:border-white/30 focus-visible:ring-0 sm:px-4 sm:py-3"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg bg-white px-8 font-[family-name:var(--font-inter)] text-sm text-black transition-all duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:text-base"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </div>
    </div>
  );
}
