'use client';
import { useState, useEffect } from 'react';
import { useMode } from '@/lib/contexts/ModeContext';
import { usePathname } from 'next/navigation';
import '../../styles/maintenanceoverlay.css';
import { Spinner } from '@/components/ui/spinner';

const maintenanceMessages = [
  'Counting our gems twice',
  'Teaching our website new tricks',
  'Untangling the server cables',
  'Asking crystals for good wifi vibes',
  'Updating our gem database',
  'Fixing our shopping cart wheels',
  'Convincing payments to be nice',
  'Organizing our digital treasure',
  'Feeding the server hamsters',
  'Checking diamonds are still forever',
];

export default function MaintenanceOverlay() {
  const { mode, maintenanceMessage } = useMode();
  const pathname = usePathname();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const isAdminPage = pathname?.startsWith('/admin') || false;
  const showOverlay = mode === 'maintenance' && !isAdminPage;

  // Cycle through maintenance messages
  useEffect(() => {
    if (showOverlay) {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % maintenanceMessages.length);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [showOverlay]);

  // Handle visibility with smooth transition and body scroll lock
  useEffect(() => {
    if (showOverlay) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [showOverlay]);

  if (!isVisible) return null;

  return (
    <div
      className={`maintenance-overlay fixed inset-0 z-[9999] transition-all duration-500 ${
        showOverlay ? 'opacity-100 backdrop-blur-md' : 'pointer-events-none opacity-0'
      }`}
      onWheel={e => e.preventDefault()}
      onTouchMove={e => e.preventDefault()}
      onScroll={e => e.preventDefault()}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Background overlay with glass effect */}
      <div className="maintenance-background absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Content container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <div className="mx-auto max-w-md text-center">
          {/* Main title */}
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">Under Maintenance</h1>

          {/* Subtitle — from admin settings */}
          <p className="mb-8 text-lg text-white/80">{maintenanceMessage}</p>

          {/* Animated loader */}
          <div className="mb-6">
            <Spinner size="48" />
          </div>

          {/* Rotating messages */}
          <div className="flex h-8 items-center justify-center">
            <p
              key={currentMessageIndex}
              className="animate-pulse text-lg text-white/70 transition-all duration-1000"
            >
              {maintenanceMessages[currentMessageIndex]}
            </p>
          </div>

          {/* Additional info */}
          <div className="mt-12 border-t border-white/20 pt-8">
            <p className="text-sm text-white/50">
              We'll be back shortly. Thank you for your patience.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 h-20 w-20 rounded-full bg-white/5 blur-xl"></div>
          <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
        </div>
      </div>
    </div>
  );
}
