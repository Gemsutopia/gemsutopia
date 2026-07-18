'use client';
import { useState, useEffect } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { getCommerceErrorMessage } from '@/lib/commerce-error';

export default function UserProfile() {
  const { user } = useBetterAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

  // Fetch profile on mount from Quickdash
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const { store } = await import('@/lib/store');
        const { user: profile } = await store.auth.getProfile();
        if (profile) {
          // Parse name into first/last
          const nameParts = (profile.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setFormData({
            firstName,
            lastName,
            phone: profile.phone || '',
            address: '',
            city: '',
            zipCode: '',
            country: '',
          });

          // If addresses are included, use the first one
          if (profile.addresses && profile.addresses.length > 0) {
            const addr = profile.addresses[0];
            setFormData(prev => ({
              ...prev,
              address: addr.addressLine1,
              city: addr.city,
              zipCode: addr.postalCode,
              country: addr.country,
            }));
          }
        }
      } catch (error) {
        setLoadError(getCommerceErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchProfile();
    else setIsLoading(false);
  }, [user, retryKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { store } = await import('@/lib/store');
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await store.auth.updateProfile({
        name: fullName,
        phone: formData.phone || undefined,
      });
      toast.success('Profile updated');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <div className="h-72 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center" role="alert">
        <p className="mb-4 text-red-800">{loadError}</p>
        <button
          onClick={() => setRetryKey(key => key + 1)}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
        >
          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg bg-white p-8 shadow-md">
        <div className="mb-8 flex items-center space-x-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <FontAwesomeIcon icon={faUser} className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {formData.firstName || formData.lastName
                ? `${formData.firstName} ${formData.lastName}`.trim()
                : 'User Profile'}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              readOnly
              disabled
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100"
              placeholder="Enter your address"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              readOnly
              disabled
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100"
              placeholder="Enter your city"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              readOnly
              disabled
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100"
              placeholder="Enter your zip code"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              readOnly
              disabled
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100"
              placeholder="Enter your country"
            />
          </div>
          <p className="md:col-span-2 text-sm text-gray-500">
            Shipping addresses are managed from the Addresses section.
          </p>
        </div>

        {isEditing && (
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
