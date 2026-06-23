'use client';
import { useState, useEffect } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faLock,
  faEye,
  faTrash,
  faEnvelope,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';

export default function UserSettings() {
  const { user } = useBetterAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    priceAlerts: false,
    stockAlerts: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showPurchases: false,
    showWishlist: false,
  });

  const [communication, setCommunication] = useState({
    emailFrequency: 'weekly',
    contactMethod: 'email',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/user/settings');
        if (res.ok) {
          const data = await res.json();
          const settings = data.data?.settings;
          if (settings) {
            if (settings.notifications) setNotifications(settings.notifications);
            if (settings.privacy) setPrivacy(settings.privacy);
            if (settings.communication) setCommunication(settings.communication);
          }
        }
      } catch {
        // Silent fail
      }
    };
    if (user) fetchSettings();
  }, [user]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    if (key === 'profileVisibility') return;
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as 'showPurchases' | 'showWishlist'],
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const result = await (authClient as any).changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (result.error) {
        toast.error(result.error.message || 'Failed to change password');
      } else {
        toast.success('Password changed');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      if (res.ok) {
        toast.success('Account deleted. Signing out...');
        // Sign out after deletion
        await authClient.signOut();
        window.location.href = '/';
      } else {
        const data = await res.json();
        toast.error(data.error?.message || 'Failed to delete account');
      }
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications, privacy, communication }),
      });
      if (res.ok) {
        toast.success('Settings saved');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {/* Notification Preferences */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center space-x-3">
          <FontAwesomeIcon icon={faBell} className="text-xl text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div>
                <h3 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h3>
                <p className="text-sm text-gray-600">
                  {key === 'orderUpdates' && 'Get notified about order status changes'}
                  {key === 'promotions' && 'Receive promotional offers and deals'}
                  {key === 'newsletter' && 'Monthly newsletter with gemstone insights'}
                  {key === 'priceAlerts' && 'Alert when wishlist items go on sale'}
                  {key === 'stockAlerts' && 'Notify when out-of-stock items are available'}
                </p>
              </div>
              <button
                onClick={() => toggleNotification(key as keyof typeof notifications)}
                className={`text-2xl transition-colors ${
                  value
                    ? 'text-purple-600 hover:text-purple-700'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                <FontAwesomeIcon icon={value ? faToggleOn : faToggleOff} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center space-x-3">
          <FontAwesomeIcon icon={faEye} className="text-xl text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Profile Visibility</h3>
              <select
                value={privacy.profileVisibility}
                onChange={e => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
                <option value="public">Public</option>
              </select>
            </div>
            <p className="text-sm text-gray-600">Control who can see your profile information</p>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <h3 className="font-medium text-gray-900">Show Purchase History</h3>
              <p className="text-sm text-gray-600">Allow others to see your purchase history</p>
            </div>
            <button
              onClick={() => togglePrivacy('showPurchases')}
              className={`text-2xl transition-colors ${
                privacy.showPurchases
                  ? 'text-purple-600 hover:text-purple-700'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              <FontAwesomeIcon icon={privacy.showPurchases ? faToggleOn : faToggleOff} />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <h3 className="font-medium text-gray-900">Show Wishlist</h3>
              <p className="text-sm text-gray-600">Make your wishlist visible to others</p>
            </div>
            <button
              onClick={() => togglePrivacy('showWishlist')}
              className={`text-2xl transition-colors ${
                privacy.showWishlist
                  ? 'text-purple-600 hover:text-purple-700'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              <FontAwesomeIcon icon={privacy.showWishlist ? faToggleOn : faToggleOff} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center space-x-3">
          <FontAwesomeIcon icon={faLock} className="text-xl text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Account Security</h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex w-full items-center justify-between transition-colors"
            >
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <span className="text-purple-600">{showPasswordForm ? '×' : '→'}</span>
            </button>
            {showPasswordForm && (
              <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {changingPassword ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>

          <button className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add extra security to your account</p>
            </div>
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Not Enabled
            </span>
          </button>

          <button className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Login History</h3>
              <p className="text-sm text-gray-600">View your recent login activity</p>
            </div>
            <span className="text-purple-600">→</span>
          </button>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center space-x-3">
          <FontAwesomeIcon icon={faEnvelope} className="text-xl text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Communication</h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium text-gray-900">Email Frequency</h3>
            <select
              value={communication.emailFrequency}
              onChange={e => setCommunication(prev => ({ ...prev, emailFrequency: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium text-gray-900">Preferred Contact Method</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="contact" value="email" className="mr-2" checked={communication.contactMethod === 'email'} onChange={() => setCommunication(prev => ({ ...prev, contactMethod: 'email' }))} />
                Email
              </label>
              <label className="flex items-center">
                <input type="radio" name="contact" value="sms" className="mr-2" checked={communication.contactMethod === 'sms'} onChange={() => setCommunication(prev => ({ ...prev, contactMethod: 'sms' }))} />
                SMS (if phone provided)
              </label>
              <label className="flex items-center">
                <input type="radio" name="contact" value="both" className="mr-2" checked={communication.contactMethod === 'both'} onChange={() => setCommunication(prev => ({ ...prev, contactMethod: 'both' }))} />
                Both
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center space-x-3">
          <FontAwesomeIcon icon={faTrash} className="text-xl text-red-600" />
          <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <button className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 transition-colors hover:bg-red-100">
            <div className="text-left">
              <h3 className="font-medium text-red-900">Export Account Data</h3>
              <p className="text-sm text-red-700">Download all your account data</p>
            </div>
            <span className="text-red-600">→</span>
          </button>

          <div>
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 transition-colors hover:bg-red-100"
            >
              <div className="text-left">
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700">Permanently delete your account and all data</p>
              </div>
              <span className="text-red-600">{showDeleteConfirm ? '×' : '→'}</span>
            </button>
            {showDeleteConfirm && (
              <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4">
                <p className="mb-3 text-sm text-red-800">
                  This action cannot be undone. Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="mb-3 w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
