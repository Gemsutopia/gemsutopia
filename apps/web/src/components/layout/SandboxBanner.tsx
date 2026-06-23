'use client';
import { useMode } from '@/lib/contexts/ModeContext';
import { usePathname } from 'next/navigation';
import { IconTestPipe } from '@tabler/icons-react';

export default function SandboxBanner() {
  const { mode } = useMode();
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin') || false;

  if (mode !== 'sandbox' || isAdminPage) return null;

  return (
    <>
      {/* Fixed top banner */}
      <div className="fixed top-0 left-0 right-0 z-[9998] bg-amber-500 text-black">
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider sm:text-sm">
          <IconTestPipe size={16} className="shrink-0" />
          <span>Sandbox Mode — Test payments only, no real charges</span>
          <IconTestPipe size={16} className="shrink-0" />
        </div>
      </div>
      {/* Spacer so content doesn't hide behind the fixed banner */}
      <div className="h-[34px] sm:h-[36px]" />
    </>
  );
}
