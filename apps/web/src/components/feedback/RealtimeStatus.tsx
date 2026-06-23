'use client';
import { IconWifi, IconWifiOff, IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { useRealtimeConnection } from '@/hooks/useRealtimeData';

export default function RealtimeStatus() {
  const { status, mode, error } = useRealtimeConnection();

  // Don't show in production unless there's an error
  if (process.env.NODE_ENV === 'production' && status !== 'failed' && !error) {
    return null;
  }

  const getStatusConfig = () => {
    if (error || status === 'failed') {
      return {
        icon: <IconAlertCircle size={16} />,
        text: 'Disconnected',
        bgColor: 'bg-red-100 border-red-200',
        textColor: 'text-red-800',
      };
    }

    if (mode === 'websocket') {
      switch (status) {
        case 'connected':
          return {
            icon: <IconWifi size={16} />,
            text: 'Live',
            bgColor: 'bg-green-100 border-green-200',
            textColor: 'text-green-800',
          };
        case 'connecting':
          return {
            icon: <IconRefresh size={16} className="animate-spin" />,
            text: 'Connecting',
            bgColor: 'bg-yellow-100 border-yellow-200',
            textColor: 'text-yellow-800',
          };
        case 'disconnected':
          return {
            icon: <IconWifiOff size={16} />,
            text: 'Offline',
            bgColor: 'bg-gray-100 border-gray-200',
            textColor: 'text-gray-800',
          };
        default:
          return {
            icon: <IconRefresh size={16} className="animate-spin" />,
            text: 'Connecting',
            bgColor: 'bg-yellow-100 border-yellow-200',
            textColor: 'text-yellow-800',
          };
      }
    }

    // Polling mode
    return {
      icon: <IconRefresh size={16} className="animate-spin" />,
      text: 'Polling',
      bgColor: 'bg-blue-100 border-blue-200',
      textColor: 'text-blue-800',
    };
  };

  const config = getStatusConfig();

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-300 ${config.bgColor} ${config.textColor}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
