import React, { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface NotificationBadgeProps {
  count: number;
  hasNew?: boolean;
  onClick?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  hasNew = false,
  onClick
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (hasNew) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasNew]);

  return (
    <button
      onClick={onClick}
      className={`relative transition-all duration-300 ${
        isAnimating ? 'animate-bounce' : ''
      }`}
    >
      {hasNew ? (
        <BellRing className="w-6 h-6 text-amber-500" />
      ) : (
        <Bell className="w-6 h-6" />
      )}
      
      {count > 0 && (
        <Badge
          variant="danger"
          className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs px-1.5"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </button>
  );
};

// Composant pour les toasts de notification
interface NotificationToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'info',
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-close après 5 secondes
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    error: 'bg-red-100 border-red-400 text-red-700',
  };

  return (
    <div className={`fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 ${typeStyles[type]}`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-lg font-bold opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Hook pour gérer les notifications toast
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>>([]);

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};
