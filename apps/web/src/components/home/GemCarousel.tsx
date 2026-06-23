'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface GemSlide {
  id: number | string;
  name: string;
  image: string;
}

interface GemCarouselProps {
  slides?: GemSlide[];
}

export default function GemCarousel({ slides }: GemCarouselProps) {
  const gems: GemSlide[] = slides && slides.length > 0 ? slides : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'center',
      loop: true,
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: 8000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (gems.length === 0) {
    return <div className="h-full w-full bg-black" />;
  }

  return (
    <div className="relative h-full w-full">
      {/* Carousel */}
      <div className="h-full w-full overflow-visible" ref={emblaRef}>
        <div className="flex h-full items-center">
          {gems.map((gem, index) => {
            const isSelected = index === selectedIndex;
            const distance = Math.abs(index - selectedIndex);
            const loopDistance = Math.min(distance, gems.length - distance);

            // Calculate opacity based on distance from selected
            let opacity = 0;
            if (isSelected) {
              opacity = 1;
            } else if (loopDistance === 1) {
              opacity = 0.7;
            } else if (loopDistance === 2) {
              opacity = 0.4;
            }

            return (
              <div
                key={gem.id}
                className="relative h-full min-w-0 flex-[0_0_100%]"
                style={{ zIndex: isSelected ? 30 : 10 - loopDistance }}
              >
                <div
                  className="absolute inset-0 overflow-hidden transition-all duration-500"
                  style={{ opacity }}
                >
                  <img src={gem.image} alt={gem.name} className="h-full w-full object-cover" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'w-6 bg-white' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
