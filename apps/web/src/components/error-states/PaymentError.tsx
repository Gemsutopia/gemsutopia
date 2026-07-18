'use client';


interface PaymentErrorProps {
  message?: string;
  onBack: () => void;
  onRetry: () => void;
  backLabel?: string;
  retryLabel?: string;
  title?: string;
}

export default function PaymentError({
  message,
  onBack,
  onRetry,
  backLabel = 'Back',
  retryLabel = 'Try Again',
  title = 'Payment Error',
}: PaymentErrorProps) {
  // Context-aware default messages
  const getDefaultMessage = () => {
    if (message?.toLowerCase().includes('payment was successful')) {
      return message;
    }
    if (message?.toLowerCase().includes('paypal')) {
      return 'Unable to complete PayPal payment.';
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
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="mb-4 font-[family-name:var(--font-bacasime)] text-3xl text-white sm:text-4xl md:text-5xl">
          {title}
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
            {backLabel}
          </button>
          <button
            onClick={onRetry}
            className="h-10 w-full rounded-md bg-white px-8 font-[family-name:var(--font-inter)] text-base text-black transition-all duration-200 hover:bg-white/90 sm:h-11 sm:w-auto sm:rounded-lg sm:px-10 sm:text-lg"
          >
            {retryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
