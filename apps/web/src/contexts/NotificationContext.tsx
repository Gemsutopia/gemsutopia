'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { IconCircleCheck, IconAlertCircle, IconX } from '@tabler/icons-react';

interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: NotificationAction;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    type: 'success' | 'error' | 'info',
    message: string,
    action?: NotificationAction
  ) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string, action?: NotificationAction) => {
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { id, type, message, action }]);

      // Auto remove after 6 seconds if there's an action, 4 seconds otherwise
      const timeout = action ? 6000 : 4000;
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, timeout);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({
  notifications,
  onRemove,
}: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-18 right-4 z-[9999] space-y-2" style={{ position: 'fixed' }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex max-w-[400px] min-w-[300px] transform items-center rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out ${
            notification.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : notification.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
          } `}
        >
          <div className="mr-3 flex-shrink-0">
            {notification.type === 'success' && (
              <IconCircleCheck size={20} className="text-green-500" />
            )}
            {notification.type === 'error' && (
              <IconAlertCircle size={20} className="text-red-500" />
            )}
            {notification.type === 'info' && (
              <IconAlertCircle size={20} className="text-blue-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
            {notification.action && (
              <button
                onClick={() => {
                  notification.action!.onClick();
                  onRemove(notification.id);
                }}
                className="mt-2 text-xs font-semibold underline transition-all hover:no-underline"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            className="ml-3 flex-shrink-0 transition-opacity hover:opacity-70"
          >
            <IconX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
