'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsented: boolean;
  updatePreferences: (newPreferences: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showBanner: boolean;
  openBanner: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const CONSENT_STORAGE_KEY = 'gemsutopia-cookie-consent';
const CONSENT_VERSION = 1;

type StoredConsent = {
  version: number;
  preferences: CookiePreferences;
};

export function CookieProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!savedConsent) {
        setShowBanner(true);
        return;
      }

      const parsed = JSON.parse(savedConsent) as StoredConsent;
      if (parsed.version !== CONSENT_VERSION || !parsed.preferences) {
        setShowBanner(true);
        return;
      }

      setPreferences({ ...defaultPreferences, ...parsed.preferences, essential: true });
      setHasConsented(true);
      setShowBanner(false);
    } catch {
      setShowBanner(true);
    }
  }, []);

  const persistConsent = (updatedPreferences: CookiePreferences) => {
    try {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ version: CONSENT_VERSION, preferences: updatedPreferences }),
      );
      // Remove the previous split-key format after successfully saving the new record.
      localStorage.removeItem('cookiePreferences');
      localStorage.removeItem('cookieConsent');
    } catch {
      // Storage can be unavailable in privacy-restricted browsers. State still works for this visit.
    }
  };

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    updatedPreferences.essential = true;
    setPreferences(updatedPreferences);
    persistConsent(updatedPreferences);
    setHasConsented(true);
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    updatePreferences(allAccepted);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    updatePreferences(onlyEssential);
    setShowBanner(false);
  };

  const openBanner = () => setShowBanner(true);

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsented,
        updatePreferences,
        acceptAll,
        rejectAll,
        showBanner,
        openBanner,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export const useCookies = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookies must be used within a CookieProvider');
  }
  return context;
};
