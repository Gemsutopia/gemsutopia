'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCookies } from '@/contexts/CookieContext';

export default function CookieSettings() {
  const [content, setContent] = useState<any>({});
  const { preferences, updatePreferences, acceptAll, rejectAll } = useCookies();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/pages/cookie-settings')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const defaultContent: Record<string, string> = {
    title: 'Cookie Settings',
    subtitle: 'Manage your cookie preferences',
    intro_text:
      'We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic. You can customize your cookie preferences below.',
    essential_title: 'Essential Cookies',
    essential_description:
      'These cookies are necessary for the website to function and cannot be switched off.',
    analytics_title: 'Analytics Cookies',
    analytics_description:
      'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    marketing_title: 'Marketing Cookies',
    marketing_description:
      'These cookies track your browsing activity to help us show you relevant advertisements.',
    functional_title: 'Functional Cookies',
    functional_description:
      'These cookies enable enhanced functionality and personalization, such as remembering your preferences.',
  };

  const getContent = (key: string): string => content[key] || defaultContent[key] || '';

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    setLocalPreferences({ essential: true, analytics: true, marketing: true, functional: true });
    acceptAll();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectAll = () => {
    setLocalPreferences({ essential: true, analytics: false, marketing: false, functional: false });
    rejectAll();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => onChange && onChange(!checked)}
      disabled={disabled}
      className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${
        checked ? 'bg-white' : 'bg-white/20'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full transition-transform duration-200 ${
          checked ? 'translate-x-7 bg-black' : 'translate-x-1 bg-white/60'
        }`}
      />
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <div className="min-h-screen flex-1 px-4 py-32 sm:px-8 md:px-16 lg:px-32">
        <div className="w-full">
          <h1 className="mb-2 text-center font-(family-name:--font-cormorant)] text-4xl text-white sm:text-5xl md:text-6xl">
            {getContent('title')}
          </h1>
          <p className="mb-8 text-center font-(family-name:--font-inter)] text-sm text-white/50">
            {getContent('subtitle')}
          </p>

          {saved && (
            <div className="mb-6 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white">
              Cookie preferences saved successfully!
            </div>
          )}

          <div className="space-y-6 text-left font-(family-name:--font-inter)] text-sm leading-relaxed text-white/80 sm:text-base">
            <p>{getContent('intro_text')}</p>

            {/* Essential Cookies */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 py-4">
              <div className="flex-1">
                <h3 className="mb-1 font-medium text-white">{getContent('essential_title')}</h3>
                <p className="text-sm text-white/60">{getContent('essential_description')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={true} disabled />
                <span className="text-xs text-white/40">Always on</span>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 py-4">
              <div className="flex-1">
                <h3 className="mb-1 font-medium text-white">{getContent('analytics_title')}</h3>
                <p className="text-sm text-white/60">{getContent('analytics_description')}</p>
              </div>
              <Toggle
                checked={localPreferences.analytics}
                onChange={checked =>
                  setLocalPreferences({ ...localPreferences, analytics: checked })
                }
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 py-4">
              <div className="flex-1">
                <h3 className="mb-1 font-medium text-white">{getContent('marketing_title')}</h3>
                <p className="text-sm text-white/60">{getContent('marketing_description')}</p>
              </div>
              <Toggle
                checked={localPreferences.marketing}
                onChange={checked =>
                  setLocalPreferences({ ...localPreferences, marketing: checked })
                }
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 py-4">
              <div className="flex-1">
                <h3 className="mb-1 font-medium text-white">{getContent('functional_title')}</h3>
                <p className="text-sm text-white/60">{getContent('functional_description')}</p>
              </div>
              <Toggle
                checked={localPreferences.functional}
                onChange={checked =>
                  setLocalPreferences({ ...localPreferences, functional: checked })
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6">
              <button
                onClick={handleSavePreferences}
                className="rounded-lg bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-white/90"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                Reject All
              </button>
            </div>

            <p className="pt-4 text-sm text-white/50">
              For more information, visit our{' '}
              <a href="/cookies" className="text-white underline hover:no-underline">
                Cookie Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
