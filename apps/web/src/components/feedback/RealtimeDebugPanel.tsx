'use client';
import { useState } from 'react';
import { IconX, IconDatabase, IconBolt, IconInfoCircle } from '@tabler/icons-react';

// Stub component until WebSocket implementation is complete
export default function RealtimeDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-20 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
        title="Open Real-time Debug Panel"
      >
        <IconDatabase size={20} />
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-96 w-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconDatabase size={16} className="text-blue-600" />
          <span className="font-semibold text-gray-800">Real-time Debug</span>
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          <IconX size={16} />
        </button>
      </div>

      {/* Info */}
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <IconBolt size={24} className="text-blue-600" />
        </div>
        <h3 className="mb-2 font-semibold text-gray-800">WebSocket Coming Soon</h3>
        <p className="mb-4 text-sm text-gray-600">
          Real-time data sync will be available once WebSocket integration is complete.
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-left">
          <IconInfoCircle size={16} className="mt-0.5 flex-shrink-0 text-yellow-600" />
          <p className="text-xs text-yellow-800">
            Currently using polling-based data refresh. Full WebSocket support for live auction bids
            and inventory updates is in development.
          </p>
        </div>
      </div>
    </div>
  );
}
