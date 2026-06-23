'use client';
import { useState, useEffect } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faPlus,
  faEdit,
  faTrash,
  faStar,
} from '@fortawesome/free-solid-svg-icons';

interface SavedAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

const emptyForm: Omit<SavedAddress, 'id'> = {
  label: 'Home',
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Canada',
  phone: '',
  isDefault: false,
};

export default function UserAddresses() {
  const { user } = useBetterAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { store } = await import('@/lib/store');
      const { addresses: quickdashAddresses } = await store.auth.getAddresses();

      setAddresses(quickdashAddresses.map(addr => ({
        id: addr.id,
        label: 'Home', // Quickdash doesn't have label field
        firstName: addr.firstName,
        lastName: addr.lastName,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || undefined,
        city: addr.city,
        province: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        phone: addr.phone || undefined,
        isDefault: addr.isDefault || false,
      })));
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { store } = await import('@/lib/store');

      // Quickdash API only supports adding addresses, not editing
      // For now, we just add new ones
      if (!editingId) {
        await store.auth.addAddress({
          firstName: form.firstName,
          lastName: form.lastName,
          company: null,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || null,
          city: form.city,
          state: form.province,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone || null,
          isDefault: form.isDefault,
        });
        toast.success('Address added');
      } else {
        // TODO: Update address endpoint not yet available
        toast.info('Editing addresses coming soon');
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchAddresses();
    } catch {
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: SavedAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;

    try {
      const { store } = await import('@/lib/store');
      await store.auth.deleteAddress(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (_id: string) => {
    // TODO: Set default address endpoint not yet available in Quickdash
    toast.info('Setting default address coming soon');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Addresses</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Addresses</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Address' : 'New Address'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Label</label>
                <select
                  value={form.label}
                  onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Address Line 1 *</label>
              <input
                type="text"
                required
                value={form.addressLine1}
                onChange={e => setForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={form.addressLine2}
                onChange={e => setForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Province/State *</label>
                <input
                  type="text"
                  required
                  value={form.province}
                  onChange={e => setForm(prev => ({ ...prev, province: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={form.postalCode}
                  onChange={e => setForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country *</label>
              <select
                value={form.country}
                onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={e => setForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Set as default address</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-purple-600 px-6 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mb-3 text-4xl text-gray-300" />
          <p className="text-gray-500">No saved addresses yet</p>
          <p className="mt-1 text-sm text-gray-400">Add an address for faster checkout</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(address => (
            <div
              key={address.id}
              className={`rounded-lg bg-white p-5 shadow-md ${address.isDefault ? 'ring-2 ring-purple-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-700">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-sm text-gray-600">{address.addressLine2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                  {address.phone && (
                    <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-yellow-600"
                      title="Set as default"
                    >
                      <FontAwesomeIcon icon={faStar} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-purple-600"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
