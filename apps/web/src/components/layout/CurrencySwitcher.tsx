'use client';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CurrencySwitcherProps {
  variant?: 'header' | 'mobile' | 'product';
}

export default function CurrencySwitcher({ variant = 'header' }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'CAD' : 'USD');
  };

  const getCurrentFlag = () => {
    return currency === 'USD' ? '🇺🇸' : '🇨🇦';
  };

  if (variant === 'mobile') {
    return (
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="mb-2 text-sm font-medium text-gray-900">Currency</div>
        <button
          onClick={toggleCurrency}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-colors"
        >
          <span className="text-base">{getCurrentFlag()}</span>
          <span>{currency}</span>
        </button>
      </div>
    );
  }

  if (variant === 'product') {
    return (
      <button
        onClick={toggleCurrency}
        className="text-black transition-colors hover:text-gray-600"
        title={`Switch to ${currency === 'USD' ? 'CAD' : 'USD'}`}
      >
        <span className="text-lg">{getCurrentFlag()}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleCurrency}
      className="text-white transition-colors hover:text-gray-300"
      title={`Switch to ${currency === 'USD' ? 'CAD' : 'USD'}`}
    >
      <span className="text-xl">{getCurrentFlag()}</span>
    </button>
  );
}
