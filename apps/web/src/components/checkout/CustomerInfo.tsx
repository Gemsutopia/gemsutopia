'use client';
import { useState, useEffect, useRef } from 'react';
import AddressInput from './AddressInput';
import Link from 'next/link';
import { IconChevronDown } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBetterAuth } from '@/contexts/BetterAuthContext';

interface CustomerData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface CustomerInfoProps {
  data: CustomerData;
  onContinue: (data: CustomerData) => void;
  onAddressChange?: (data: CustomerData) => void;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

const COUNTRIES = [
  { code: 'Canada', name: 'Canada', flagClass: 'fi fi-ca' },
  { code: 'United States', name: 'United States', flagClass: 'fi fi-us' },
];

export default function CustomerInfo({ data, onContinue, onAddressChange }: CustomerInfoProps) {
  const [formData, setFormData] = useState<CustomerData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useBetterAuth();

  // Dynamic labels based on country
  const isUS = formData.country === 'United States';
  const stateLabel = isUS ? 'State' : 'Province';
  const zipLabel = isUS ? 'Zip Code' : 'Postal Code';
  const zipPlaceholder = isUS ? '12345' : 'K1A 0A6';
  const stateOptions = isUS ? US_STATES : CANADIAN_PROVINCES;

  // Load saved customer data from localStorage on mount
  useEffect(() => {
    setIsClient(true);

    const savedCustomerData = localStorage.getItem('customerShippingInfo');
    if (savedCustomerData) {
      try {
        const parsed = JSON.parse(savedCustomerData);
        // Only load if the current data is empty (first time on checkout)
        if (!data.email && !data.firstName && !data.lastName) {
          setFormData(parsed);
        }
      } catch {
        // Error loading saved customer data
      }
    }
  }, [data]);

  // Close country dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (countryCode: string) => {
    const updatedFormData = { ...formData, country: countryCode, state: '' };
    setFormData(updatedFormData);
    setCountryDropdownOpen(false);
    if (onAddressChange) {
      onAddressChange(updatedFormData);
    }
  };

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country) || COUNTRIES[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    // If country changes, clear state to force reselection
    if (name === 'country') {
      updatedFormData.state = '';
    }

    setFormData(updatedFormData);

    // Trigger tax recalculation IMMEDIATELY when country or state changes
    if (onAddressChange && (name === 'country' || name === 'state')) {
      onAddressChange(updatedFormData);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'Province/State is required';
    if (!formData.zipCode) newErrors.zipCode = 'Postal/Zip code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await validateForm()) {
      // Save customer data to localStorage for future use
      if (isClient) {
        try {
          localStorage.setItem('customerShippingInfo', JSON.stringify(formData));
        } catch {
          // Error saving customer data
        }
      }

      // Save address to user's account if checkbox is checked
      if (saveAddress && user) {
        try {
          await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              label: 'Shipping',
              firstName: formData.firstName,
              lastName: formData.lastName,
              addressLine1: formData.address,
              addressLine2: formData.apartment || '',
              city: formData.city,
              province: formData.state,
              postalCode: formData.zipCode,
              country: formData.country,
              phone: formData.phone || '',
              isDefault: false,
            }),
          });
        } catch {
          // Non-blocking - don't prevent checkout if save fails
        }
      }

      onContinue(formData);
    }
  };

  const inputClasses =
    'h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 font-[family-name:var(--font-inter)] text-sm text-white placeholder-white/40 transition-colors focus:border-white/20 focus:outline-none xs:h-11';
  const errorInputClasses = 'border-red-500/50 focus:border-red-500';
  const labelClasses = 'mb-2 block font-[family-name:var(--font-inter)] text-sm text-white/60';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClasses}>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`${inputClasses} ${errors.email ? errorInputClasses : ''}`}
          placeholder="your@email.com"
        />
        {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3 xs:gap-4">
        <div>
          <label htmlFor="firstName" className={labelClasses}>
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`${inputClasses} ${errors.firstName ? errorInputClasses : ''}`}
            placeholder="John"
          />
          {errors.firstName && <p className="mt-1.5 text-sm text-red-400">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClasses}>
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`${inputClasses} ${errors.lastName ? errorInputClasses : ''}`}
            placeholder="Doe"
          />
          {errors.lastName && <p className="mt-1.5 text-sm text-red-400">{errors.lastName}</p>}
        </div>
      </div>

      {/* Country */}
      <div ref={countryDropdownRef} className="relative">
        <label className={labelClasses}>
          Country
        </label>
        <button
          type="button"
          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
          className={`${inputClasses} flex items-center justify-between text-left`}
        >
          <span className="flex items-center gap-2">
            <span className={selectedCountry.flagClass} />
            <span>{selectedCountry.name}</span>
          </span>
          <IconChevronDown
            size={16}
            className={`text-white/40 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {countryDropdownOpen && (
            <motion.div
              className="absolute top-full left-0 z-50 mt-1 w-full"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="rounded-xl border border-white/10 bg-black/90 p-2 backdrop-blur-xl">
                {COUNTRIES.map((country, index) => (
                  <motion.button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      formData.country === country.code
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <span className={country.flagClass} />
                    <span>{country.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Street Address */}
      <div>
        <label htmlFor="address" className={labelClasses}>
          Street Address
        </label>
        <AddressInput
          value={formData.address}
          onChange={value => {
            setFormData(prev => ({ ...prev, address: value }));
            if (errors.address) {
              setErrors(prev => ({ ...prev, address: '' }));
            }
          }}
          onAddressSelect={(components) => {
            if (components) {
              setFormData(prev => ({
                ...prev,
                address: components.address || prev.address,
                city: components.city || prev.city,
                state: components.state || prev.state,
                zipCode: components.zipCode || prev.zipCode,
                country: components.country || prev.country,
              }));
            }
          }}
          placeholder="Start typing your address..."
          error={errors.address}
          country={formData.country as 'Canada' | 'United States'}
        />
      </div>

      {/* Apartment */}
      <div>
        <label htmlFor="apartment" className={labelClasses}>
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          id="apartment"
          name="apartment"
          value={formData.apartment || ''}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Apt 4B"
        />
      </div>

      {/* City, State, Zip Row */}
      <div className="grid grid-cols-3 gap-3 xs:gap-4">
        <div>
          <label htmlFor="city" className={labelClasses}>
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`${inputClasses} ${errors.city ? errorInputClasses : ''}`}
            placeholder="Toronto"
          />
          {errors.city && <p className="mt-1.5 text-sm text-red-400">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className={labelClasses}>
            {stateLabel}
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`${inputClasses} ${errors.state ? errorInputClasses : ''}`}
          >
            <option value="">Select</option>
            {stateOptions.map(option => (
              <option key={option.code} value={option.code}>
                {option.code}
              </option>
            ))}
          </select>
          {errors.state && <p className="mt-1.5 text-sm text-red-400">{errors.state}</p>}
        </div>

        <div>
          <label htmlFor="zipCode" className={labelClasses}>
            {zipLabel}
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={`${inputClasses} ${errors.zipCode ? errorInputClasses : ''}`}
            placeholder={zipPlaceholder}
          />
          {errors.zipCode && <p className="mt-1.5 text-sm text-red-400">{errors.zipCode}</p>}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className={labelClasses}>
          Phone Number (optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          className={inputClasses}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Address Notice */}
      <p className="font-[family-name:var(--font-inter)] text-xs text-white/40">
        Please ensure your shipping address is accurate. We are not responsible for packages sent to incorrect addresses.
      </p>

      {/* Save Address Checkbox (logged-in users only) */}
      {user && (
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={e => setSaveAddress(e.target.checked)}
            className="h-4 w-4 rounded border-white/30 bg-transparent accent-white"
          />
          <span className="font-[family-name:var(--font-inter)] text-sm text-white/60">
            Save this address to my account
          </span>
        </label>
      )}

      {/* Continue Button */}
      <button
        type="submit"
        className="mt-6 h-10 w-full rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm font-medium text-black transition-colors hover:bg-white/90 xs:h-11 xs:text-base"
      >
        Continue to Payment
      </button>

      {/* Continue Shopping Link */}
      <Link
        href="/shop"
        className="mt-4 block text-center font-[family-name:var(--font-inter)] text-sm text-white/60 transition-colors hover:text-white"
      >
        Continue Shopping
      </Link>
    </form>
  );
}
