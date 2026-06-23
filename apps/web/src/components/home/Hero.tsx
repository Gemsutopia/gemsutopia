'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useCMSContent } from '@/hooks/useCMSContent';
import '../../styles/hero.css';

export default function Hero() {
  const { getHeroImages, loading } = useCMSContent();

  // Get images from CMS
  const images = getHeroImages();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const scrollToSlide = (index: number) => {
    setCurrentIndex(index);
    setTouchOffset(0);
    setIsDragging(false);
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % images.length;
    scrollToSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    scrollToSlide(newIndex);
  };

  // Touch handlers for swipe with drag follow
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
    setTouchOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;

    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart;
    setTouchOffset(diff);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 10; // Very small threshold

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setTouchStart(null);
    setTouchOffset(0);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const index = Math.round(scrollLeft / clientWidth);
        setCurrentIndex(index);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Reset to first slide when images change
  useEffect(() => {
    setCurrentIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [images.length]);

  // Auto-scroll effect
  useEffect(() => {
    if (images.length === 0 || loading) return;

    const interval = setInterval(() => {
      const newIndex = (currentIndex + 1) % images.length;
      scrollToSlide(newIndex);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [currentIndex, images.length, loading]);

  // Show loading state or empty state
  if (loading || images.length === 0) {
    return (
      <section className="h-[65vh] flex-shrink-0 overflow-hidden bg-black xs:h-[68vh] sm:h-[65vh] md:h-[72vh] lg:h-[78vh] xl:h-[80vh] 3xl:h-[85vh]">
        <div className="flex h-full w-full items-center justify-center">
          {loading ? (
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white xs:h-14 xs:w-14 md:h-16 md:w-16"></div>
          ) : (
            <div className="text-center text-white">
              <p className="mb-2 text-lg xs:text-xl">No hero images available</p>
              <p className="text-sm text-slate-400 xs:text-base">Upload images from the admin dashboard</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="h-[65vh] flex-shrink-0 overflow-hidden bg-black xs:h-[68vh] sm:h-[65vh] md:h-[72vh] lg:h-[78vh] xl:h-[80vh] 3xl:h-[85vh]">
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="relative flex h-full w-full items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Left tap area - mobile only */}
          <button
            onClick={prevSlide}
            className="absolute top-0 left-0 z-30 h-full w-1/2 cursor-pointer bg-transparent md:w-24 md:cursor-default lg:w-40"
            aria-label="Previous slide"
          />

          {/* Right tap area - mobile only */}
          <button
            onClick={nextSlide}
            className="absolute top-0 right-0 z-30 h-full w-1/2 cursor-pointer bg-transparent md:w-24 md:cursor-default lg:w-40"
            aria-label="Next slide"
          />

          {/* Slider with 3-image preview */}
          <div ref={scrollRef} className="relative h-full w-full overflow-hidden">
            {/* Mobile: Swipeable carousel */}
            <div className="relative h-full w-full overflow-hidden md:hidden">
              <div
                className="hero-carousel flex h-full"
                style={
                  {
                    '--translate-x': `${-currentIndex * 100}vw`,
                    '--touch-offset': `${touchOffset}px`,
                    '--carousel-width': `${images.length * 100}vw`,
                    '--transition': isDragging ? 'none' : 'transform 0.5s ease-in-out',
                  } as React.CSSProperties
                }
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="hero-slide flex h-full flex-shrink-0 items-center justify-center"
                  >
                    <div className="flex h-full w-full items-center justify-center px-1.5 py-3 xs:px-2 xs:py-4 sm:px-3 sm:py-5">
                      <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-700 xs:rounded-2xl sm:rounded-3xl">
                        <Image
                          src={image}
                          alt={`Hero image ${index + 1}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="100vw"
                          quality={85}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop 3-image preview */}
            <div className="absolute inset-0 hidden h-full items-center md:flex">
              {/* Previous Image - Left side, partially visible */}
              <div className="absolute top-0 left-0 z-10 h-full w-1/4 opacity-50 transition-all duration-300 md:w-1/3">
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-neutral-700">
                  <Image
                    src={images[(currentIndex - 1 + images.length) % images.length]}
                    alt={`Previous image`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                    quality={60}
                  />
                </div>
              </div>

              {/* Active Image - Center, focused */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="h-full w-full px-0 md:px-20 lg:px-32 xl:px-40 3xl:px-52">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl bg-neutral-700 lg:rounded-3xl">
                    <Image
                      src={images[currentIndex]}
                      alt={`Hero image ${currentIndex + 1}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="100vw"
                      quality={75}
                    />
                  </div>
                </div>
              </div>

              {/* Next Image - Right side, partially visible */}
              <div className="absolute top-0 right-0 z-10 h-full w-1/4 opacity-50 transition-all duration-300 md:w-1/3">
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-neutral-700">
                  <Image
                    src={images[(currentIndex + 1) % images.length]}
                    alt={`Next image`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                    quality={60}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pagination dots on top of image */}
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transform xs:bottom-5 md:bottom-6 lg:bottom-8">
            <div className="flex gap-1.5 xs:gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={`h-1.5 w-1.5 rounded-full transition-colors xs:h-2 xs:w-2 md:h-2.5 md:w-2.5 ${
                    currentIndex === index ? 'bg-black' : 'bg-neutral-600'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute right-3 bottom-3 z-20 xs:right-4 xs:bottom-4 md:right-6 md:bottom-5 lg:right-8 lg:bottom-6">
            <Image
              src="/logos/gems-logo.png"
              alt="Gemsutopia Watermark"
              width={64}
              height={64}
              className="h-12 object-contain xs:h-14 md:h-16 lg:h-18"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
