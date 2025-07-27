"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const notificationStyles = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-600",
    progressColor: "bg-green-600"
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-600",
    progressColor: "bg-red-600"
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-600",
    progressColor: "bg-yellow-600"
  },
  info: {
    icon: AlertCircle,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-600",
    progressColor: "bg-blue-600"
  }
};

export default function Notification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  showCloseButton = true
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const styles = notificationStyles[type];
  const Icon = styles.icon;

  useEffect(() => {
    // Show notification
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide timer
    let hideTimer: NodeJS.Timeout;
    if (duration > 0) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
    }

    // Progress bar animation
    let progressTimer: NodeJS.Timeout;
    if (duration > 0) {
      const startTime = Date.now();
      progressTimer = setInterval(() => {
        if (!isPaused) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
          setProgress(remaining);
          
          if (remaining <= 0) {
            clearInterval(progressTimer);
          }
        }
      }, 10);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(progressTimer);
    };
  }, [duration, onClose, isPaused]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-out ${
        isVisible 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg overflow-hidden`}>
        {/* Progress bar */}
        {duration > 0 && (
          <div className="h-1 bg-gray-200">
            <div
              className={`h-full ${styles.progressColor} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${styles.textColor}`}>
                {title}
              </h3>
              {message && (
                <p className={`mt-1 text-sm ${styles.textColor} opacity-90`}>
                  {message}
                </p>
              )}
            </div>
            {showCloseButton && (
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleClose}
                  className={`inline-flex rounded-md p-1.5 ${styles.textColor} hover:bg-opacity-20 hover:bg-black transition-colors duration-200`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification manager for multiple notifications
export function NotificationManager() {
  const [notifications, setNotifications] = useState<Array<NotificationProps & { id: string }>>([]);

  const addNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      onClose: () => removeNotification(id)
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300"
          style={{
            transform: `translateY(${index * 80}px)`
          }}
        >
          <Notification {...notification} />
        </div>
      ))}
    </div>
  );
}

// Hook for easy notification usage
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Array<NotificationProps & { id: string }>>([]);

  const showNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      onClose: () => removeNotification(id)
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification({ type: "success", title, message });
  };

  const showError = (title: string, message?: string) => {
    showNotification({ type: "error", title, message });
  };

  const showWarning = (title: string, message?: string) => {
    showNotification({ type: "warning", title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showNotification({ type: "info", title, message });
  };

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification
  };
}; 