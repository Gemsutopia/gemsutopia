'use client';

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
}

interface TestimonialMarqueeProps {
  testimonials: Testimonial[];
}

export default function TestimonialMarquee({ testimonials }: TestimonialMarqueeProps) {
  // Fixed values - no calculations, no percentages
  const cardWidth = 580;
  const gap = 24;
  const totalCards = testimonials.length;

  // Exact pixel width of one set: (cards * cardWidth) + (gaps between cards)
  const setWidth = totalCards * cardWidth + (totalCards - 1) * gap;

  // We need to scroll by setWidth + one gap (to reach the start of the duplicate)
  const scrollDistance = setWidth + gap;

  const renderCard = (testimonial: Testimonial, suffix: string) => (
    <div
      key={`${testimonial.id}-${suffix}`}
      style={{
        width: `${cardWidth}px`,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        overflow: 'hidden',
        padding: '14px 18px',
      }}
      className="flex flex-col justify-between"
    >
      <div>
        <div className="mb-1.5 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={i < testimonial.rating ? 'white' : 'none'}
              stroke="white"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <p className="line-clamp-2 font-[family-name:var(--font-inter)] text-sm leading-snug text-white/80">
          &ldquo;{testimonial.text}&rdquo;
        </p>
      </div>
      <p className="mt-2 font-[family-name:var(--font-inter)] text-xs font-medium text-white/60">
        — {testimonial.name}
      </p>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes testimonial-scroll-${totalCards} {
            0% { transform: translateX(-${scrollDistance}px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
      <div style={{ overflow: 'hidden', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            gap: `${gap}px`,
            width: 'max-content',
            animation: `testimonial-scroll-${totalCards} ${Math.max(90, Math.round(scrollDistance / 22))}s linear infinite`,
            willChange: 'transform',
          }}
        >
          {testimonials.map(t => renderCard(t, 'a'))}
          {testimonials.map(t => renderCard(t, 'b'))}
        </div>
      </div>
    </>
  );
}
