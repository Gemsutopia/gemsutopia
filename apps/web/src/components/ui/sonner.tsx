'use client';

import {
  IconCircleCheck,
  IconInfoCircle,
  IconCircleX,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <IconCircleCheck size={16} className="text-emerald-400" />,
        info: <IconInfoCircle size={16} className="text-blue-400" />,
        warning: <IconAlertTriangle size={16} className="text-amber-400" />,
        error: <IconCircleX size={16} className="text-red-400" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'flex items-center gap-3 w-[356px] px-4 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-white text-sm shadow-lg',
          icon: 'shrink-0 order-first',
          content: 'flex-1',
          title: 'font-medium text-sm',
          description: 'text-xs text-white/70',
          actionButton: 'px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium hover:bg-white hover:text-black transition-all whitespace-nowrap shrink-0',
          cancelButton: 'px-3 py-1.5 rounded-md text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap shrink-0',
          closeButton: 'rounded-md',
          success: 'border-emerald-500/30',
          error: 'border-red-500/30',
          warning: 'border-amber-500/30',
          info: 'border-blue-500/30',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
