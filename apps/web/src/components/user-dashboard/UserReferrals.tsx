'use client';
import { useState, useEffect } from 'react';
import { useBetterAuth } from '@/contexts/BetterAuthContext';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShare,
  faCopy,
  faCheck,
  faGift,
  faUsers,
  faDollarSign,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { IconBrandTwitter, IconBrandFacebook, IconMail } from '@tabler/icons-react';

interface Referral {
  code: string;
  referrerEmail: string;
  referrerName: string | null;
  timesUsed: number;
  totalRewardsEarned: string;
  referrerRewardType: string;
  referrerRewardValue: string;
  referredDiscountType: string;
  referredDiscountValue: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  recentConversions?: Array<{
    id: string;
    referredName: string;
    orderTotal: string;
    discountApplied: string;
    referrerReward: string;
    referrerRewardStatus: string;
    createdAt: string;
  }>;
}

export default function UserReferrals() {
  const { user } = useBetterAuth();
  const { formatPrice } = useCurrency();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchReferral();
    }
  }, [user?.email]);

  const fetchReferral = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/referrals?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (result.success && result.data.referral) {
        setReferral(result.data.referral);
      } else {
        setReferral(null);
      }
    } catch (error) {
      console.error('Failed to fetch referral:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReferral = async () => {
    if (!user?.email) return;

    setCreating(true);
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name || undefined,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.referral) {
        setReferral(result.data.referral);
        toast.success( 'Your referral code has been created!');
      } else {
        toast.error( 'Failed to create referral code');
      }
    } catch (error) {
      console.error('Failed to create referral:', error);
      toast.error( 'Failed to create referral code');
    } finally {
      setCreating(false);
    }
  };

  const copyCode = () => {
    if (!referral?.code) return;

    navigator.clipboard.writeText(referral.code);
    setCopied(true);
    toast.success( 'Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    if (!referral?.code) return;

    const url = `${window.location.origin}?ref=${referral.code}`;
    navigator.clipboard.writeText(url);
    toast.success( 'Referral link copied!');
  };

  const shareViaTwitter = () => {
    if (!referral?.code) return;

    const text = `Check out Gemsutopia! Use my referral code ${referral.code} to get ${referral.referredDiscountValue}% off your first order!`;
    const url = `${window.location.origin}?ref=${referral.code}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareViaFacebook = () => {
    if (!referral?.code) return;

    const url = `${window.location.origin}?ref=${referral.code}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!referral?.code) return;

    const subject = 'Here\'s a special discount for you!';
    const body = `Hey! I've been shopping at Gemsutopia and thought you might like it too. Use my referral code ${referral.code} to get ${referral.referredDiscountValue}% off your first order!\n\nShop here: ${window.location.origin}?ref=${referral.code}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="mt-1 text-gray-600">Share your unique code and earn rewards when friends make purchases.</p>
      </div>

      {!referral ? (
        // No referral code yet - prompt to create one
        <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <FontAwesomeIcon icon={faGift} className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Get Your Referral Code</h2>
          <p className="mb-6 text-gray-600">
            Create your unique referral code and start earning rewards! When friends use your code, they get 10% off and you earn 10% of their order value.
          </p>
          <button
            onClick={createReferral}
            disabled={creating}
            className="inline-flex items-center rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {creating ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faGift} className="mr-2 h-4 w-4" />
                Create My Referral Code
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Referral Code Card */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Referral Code</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                referral.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {referral.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-lg border border-purple-300 bg-white p-4">
              <span className="text-2xl font-bold tracking-widest text-purple-700">{referral.code}</span>
              <button
                onClick={copyCode}
                className="flex items-center rounded-lg bg-purple-100 px-4 py-2 text-purple-700 transition-colors hover:bg-purple-200"
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-2 h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-white/50 p-4">
              <p className="text-sm text-gray-700">
                <strong>How it works:</strong> Share your code with friends. When they make their first purchase using your code:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• They get <strong>{referral.referredDiscountValue}%</strong> off their order</li>
                <li>• You earn <strong>{referral.referrerRewardValue}%</strong> of their order total as store credit</li>
              </ul>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyLink}
                className="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faShare} className="mr-2 h-4 w-4" />
                Copy Link
              </button>
              <button
                onClick={shareViaTwitter}
                className="flex items-center rounded-lg bg-sky-100 px-4 py-2 text-sky-700 transition-colors hover:bg-sky-200"
              >
                <IconBrandTwitter size={16} className="mr-2" />
                Twitter
              </button>
              <button
                onClick={shareViaFacebook}
                className="flex items-center rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200"
              >
                <IconBrandFacebook size={16} className="mr-2" />
                Facebook
              </button>
              <button
                onClick={shareViaEmail}
                className="flex items-center rounded-lg bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200"
              >
                <IconMail size={16} className="mr-2" />
                Email
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-2 flex items-center text-gray-500">
                <FontAwesomeIcon icon={faUsers} className="mr-2 h-4 w-4" />
                <span className="text-sm">Referrals</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{referral.timesUsed}</p>
              <p className="text-sm text-gray-500">successful conversions</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-2 flex items-center text-gray-500">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 h-4 w-4" />
                <span className="text-sm">Total Earned</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(parseFloat(referral.totalRewardsEarned || '0'))}
              </p>
              <p className="text-sm text-gray-500">in store credit</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-2 flex items-center text-gray-500">
                <FontAwesomeIcon icon={faGift} className="mr-2 h-4 w-4" />
                <span className="text-sm">Your Reward</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{referral.referrerRewardValue}%</p>
              <p className="text-sm text-gray-500">per referral</p>
            </div>
          </div>

          {/* Recent Conversions */}
          {referral.recentConversions && referral.recentConversions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">Recent Referrals</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {referral.recentConversions.map((conversion) => (
                  <div key={conversion.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-gray-900">{conversion.referredName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(conversion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +{formatPrice(parseFloat(conversion.referrerReward))}
                      </p>
                      <p className={`text-xs ${
                        conversion.referrerRewardStatus === 'credited'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}>
                        {conversion.referrerRewardStatus === 'credited' ? 'Credited' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No conversions yet */}
          {(!referral.recentConversions || referral.recentConversions.length === 0) && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <FontAwesomeIcon icon={faUsers} className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 font-semibold text-gray-900">No referrals yet</h3>
              <p className="text-gray-600">
                Share your code with friends to start earning rewards!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
