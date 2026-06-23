'use client';

import Image from 'next/image';

interface PaymentErrorProps {
  message?: string;
  onBack: () => void;
  onRetry: () => void;
}

export default function PaymentError({ message, onBack, onRetry }: PaymentErrorProps) {
  // Context-aware default messages
  const getDefaultMessage = () => {
    if (message?.toLowerCase().includes('stripe')) {
      return 'Unable to connect to our payment processor.';
    }
    if (message?.toLowerCase().includes('paypal')) {
      return 'Unable to complete PayPal payment.';
    }
    if (message?.toLowerCase().includes('coinbase') || message?.toLowerCase().includes('crypto')) {
      return 'Unable to create crypto payment.';
    }
    if (message?.toLowerCase().includes('network') || message?.toLowerCase().includes('fetch')) {
      return 'Please check your internet connection.';
    }
    if (message?.toLowerCase().includes('configured')) {
      return 'This payment method is temporarily unavailable.';
    }
    return 'Something went wrong with your payment.';
  };

  const displayMessage = getDefaultMessage();

  return (
    <div className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden px-4">
      {/* Background Spinning Gem - same as about page */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/logos/gem2.svg"
          alt=""
          width={600}
          height={600}
          className="h-[120vw] w-[120vw] animate-[spin_60s_linear_infinite] opacity-[0.06] drop-shadow-[0_0_80px_rgba(255,255,255,0.3)] md:h-[600px] md:w-[600px]"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="mb-4 font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl">
          Payment Error
        </h2>

        {/* Message */}
        <p className="mb-10 max-w-md font-[family-name:var(--font-inter)] text-base text-white/60 sm:text-lg">
          {displayMessage}
        </p>

        {/* Buttons - Hero style */}
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <button
            onClick={onBack}
            className="h-10 w-full rounded-md bg-white/10 px-8 font-[family-name:var(--font-inter)] text-base text-white transition-all duration-200 hover:bg-white/20 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg"
          >
            Back
          </button>
          <button
            onClick={onRetry}
            className="h-10 w-full rounded-md bg-white px-8 font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
