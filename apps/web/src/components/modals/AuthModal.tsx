'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { signUp, signIn } from '@/lib/auth-client';
import { toast } from 'sonner';
import { AccountCreatedSuccess } from '@/components/success-states';

// Product images for random selection
const gemImages = [
  '/images/products/gem.png',
  '/images/products/gem2.png',
  '/images/products/gem3.png',
  '/images/products/gem4.png',
  '/images/products/gem5.png',
  '/images/products/gem6.png',
  '/images/products/gem7.png',
  '/images/products/gem8.png',
  '/images/products/gem9.png',
  '/images/products/gem10.png',
  '/images/products/gem11.png',
];

interface AuthModalProps {
  mode: 'sign-up' | 'sign-in';
  onClose?: () => void;
  redirectTo?: string;
}

export default function AuthModal({ mode: initialMode, onClose, redirectTo = '/shop' }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [randomImage, setRandomImage] = useState(gemImages[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  // Pick random image on mount
  useEffect(() => {
    setRandomImage(gemImages[Math.floor(Math.random() * gemImages.length)]);
  }, []);

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' };
    return { score: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'sign-up') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters');
          setIsSubmitting(false);
          return;
        }

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        const { error } = await signUp.email({
          email: formData.email,
          password: formData.password,
          name: fullName || '',
        });

        if (error) {
          toast.error(error.message || 'Failed to create account');
        } else {
          setSuccessEmail(formData.email);
          setShowSuccess(true);
        }
      } else {
        const { error } = await signIn.email({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast.error(error.message || 'Invalid email or password');
        } else {
          toast.success('Welcome back!');
          router.push(redirectTo);
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-black p-6 shadow-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 transition-colors hover:text-white"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
          <AccountCreatedSuccess email={successEmail} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white/60 transition-colors hover:text-white"
          aria-label="Close"
        >
          <IconX size={20} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Form Side */}
          <div className="p-4 md:p-8">
            <div className="mb-4 md:mb-6 text-center">
              <h1 className="mb-2 font-[family-name:var(--font-bacasime)] text-2xl text-white md:text-3xl">
                {mode === 'sign-up' ? 'Create Your Account' : 'Welcome Back'}
              </h1>
              <p className="text-sm text-white/60">
                {mode === 'sign-up'
                  ? 'Join Gemsutopia and discover rare gems'
                  : 'Sign in to continue your journey'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">
              {mode === 'sign-up' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="firstName" className="text-xs text-white/70">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="lastName" className="text-xs text-white/70">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-xs text-white/70">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-xs text-white/70">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30"
                />
                {mode === 'sign-up' && formData.password && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength.score ? passwordStrength.color : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/50">{passwordStrength.label}</span>
                  </div>
                )}
              </div>

              {mode === 'sign-up' && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="confirmPassword" className="text-xs text-white/70">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30"
                  />
                  <p className="text-xs text-white/40">Must be at least 8 characters</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 md:mt-2 h-10 md:h-11 w-full rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm text-black transition-all duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? mode === 'sign-up'
                    ? 'Creating Account...'
                    : 'Signing In...'
                  : mode === 'sign-up'
                    ? 'Create Account'
                    : 'Sign In'}
              </Button>

              <p className="mt-1 md:mt-2 text-center text-xs text-white/40">
                {mode === 'sign-up' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('sign-in')}
                      className="text-white underline hover:text-white/80"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('sign-up')}
                      className="text-white underline hover:text-white/80"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>

              <p className="text-center text-xs text-white/30">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-white/50">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-white/50">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>

          {/* Image Side */}
          <div className="relative hidden md:block">
            <Image
              src={randomImage}
              alt="Gemstone"
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
