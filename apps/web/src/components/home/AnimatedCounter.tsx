'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 2000,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Parse the value to extract number and suffix (e.g., "250+" -> 250, "+")
  const parseValue = (val: string) => {
    const match = val.match(/^([\d.]+)(.*)$/);
    if (match) {
      return { number: parseFloat(match[1]), suffix: match[2] };
    }
    return { number: 0, suffix: val };
  };

  const { number: targetNumber, suffix } = parseValue(value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
            setDisplayValue('0');
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = performance.now();
    const isDecimal = targetNumber % 1 !== 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentValue = easeOutQuart * targetNumber;

      if (progress >= 1) {
        setDisplayValue(isDecimal ? targetNumber.toFixed(1) : targetNumber.toString());
        return;
      }

      if (isDecimal) {
        setDisplayValue(currentValue.toFixed(1));
      } else {
        setDisplayValue(Math.round(currentValue).toString());
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isVisible, targetNumber, duration]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
      {suffix}
    </span>
  );
}
