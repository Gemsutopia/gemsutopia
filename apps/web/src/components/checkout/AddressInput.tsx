'use client';
import { useState, useEffect, useRef } from 'react';
import { IconMapPin, IconLoader2 } from '@tabler/icons-react';

interface AddressSuggestion {
  description: string;
  placeId: string | null;
  mainText: string;
  secondaryText: string;
}

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (components: AddressComponents | null) => void;
  placeholder?: string;
  error?: string;
  country?: 'Canada' | 'United States';
}

export default function AddressInput({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Start typing your address...',
  error,
  country = 'Canada',
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear suggestions when value is empty
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce address suggestions
    debounceRef.current = setTimeout(async () => {
      if (value.trim().length >= 3) {
        setLoading(true);

        try {
          const params = new URLSearchParams({
            q: value.trim(),
            country: country,
          });

          const response = await fetch(`/api/address-suggestions?${params}`);
          const data = await response.json();

          if (data.success && data.data?.suggestions) {
            setSuggestions(data.data.suggestions);
            setShowSuggestions(data.data.suggestions.length > 0);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch {
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    // Set the address text immediately
    const addressText = suggestion.mainText || suggestion.description.split(',')[0];
    onChange(addressText);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    // If we have a placeId (from Google), fetch the full details
    if (suggestion.placeId && onAddressSelect) {
      try {
        const response = await fetch(`/api/address-suggestions/details?place_id=${suggestion.placeId}`);
        const data = await response.json();

        if (data.success && data.data?.components) {
          onAddressSelect(data.data.components);
        }
      } catch {
        // If details fetch fails, try to parse from description
        const components = parseAddressFromDescription(suggestion.description);
        if (components) {
          onAddressSelect(components);
        }
      }
    } else if (onAddressSelect) {
      // Parse from description for OSM results
      const components = parseAddressFromDescription(suggestion.description);
      if (components) {
        onAddressSelect(components);
      }
    }
  };

  const parseAddressFromDescription = (description: string): AddressComponents | null => {
    const parts = description.split(', ');
    if (parts.length < 3) return null;

    const address = parts[0];
    let city = '';
    let state = '';
    let zipCode = '';
    let detectedCountry = 'Canada';

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();

      // Canadian postal code
      if (/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(part)) {
        zipCode = part;
      }
      // US zip code
      else if (/^\d{5}(-\d{4})?$/.test(part)) {
        zipCode = part;
      }
      // Country detection
      else if (part.toLowerCase().includes('canada')) {
        detectedCountry = 'Canada';
      }
      else if (part.toLowerCase().includes('united states') || part.toLowerCase() === 'usa') {
        detectedCountry = 'United States';
      }
      // Province/State detection
      else if (isProvinceOrState(part)) {
        state = normalizeProvince(part);
      }
      // City is usually first non-matched part
      else if (!city && i === 1) {
        city = part;
      }
    }

    return { address, city, state, zipCode, country: detectedCountry };
  };

  const isProvinceOrState = (text: string): boolean => {
    const codes = [
      'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
      'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
      'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
      'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    ];
    const provinces = ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan'];
    return codes.includes(text.toUpperCase()) || provinces.some(p => text.toLowerCase().includes(p.toLowerCase()));
  };

  const normalizeProvince = (text: string): string => {
    const map: Record<string, string> = {
      'ontario': 'ON', 'quebec': 'QC', 'british columbia': 'BC', 'alberta': 'AB',
      'manitoba': 'MB', 'saskatchewan': 'SK', 'nova scotia': 'NS', 'new brunswick': 'NB',
      'newfoundland and labrador': 'NL', 'prince edward island': 'PE', 'yukon': 'YT',
      'northwest territories': 'NT', 'nunavut': 'NU',
    };
    const lower = text.toLowerCase();
    return map[lower] || text.toUpperCase();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const inputClasses =
    'h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-10 font-[family-name:var(--font-inter)] text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none xs:h-11';

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`${inputClasses} ${error ? 'border-red-500/50 focus:border-red-500' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <IconLoader2 size={16} className="animate-spin text-white/40" />
          ) : (
            <IconMapPin size={16} className="text-white/40" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-black/90 p-2 backdrop-blur-xl"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                index === selectedIndex ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <IconMapPin size={16} className="mt-0.5 flex-shrink-0 text-white/40" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {suggestion.mainText || suggestion.description.split(',')[0]}
                </div>
                {suggestion.secondaryText && (
                  <div className="truncate text-xs text-white/50">
                    {suggestion.secondaryText}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}
