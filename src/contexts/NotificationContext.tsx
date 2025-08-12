import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearExpired: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

// Local storage functions
const getNotifications = (): Notification[] => {
  const stored = localStorage.getItem('ct-notifications');
  if (stored) {
    const notifications = JSON.parse(stored);
    return notifications.map((notif: any) => ({
      ...notif,
      createdAt: new Date(notif.createdAt),
      expiresAt: notif.expiresAt ? new Date(notif.expiresAt) : undefined,
    }));
  }
  return [];
};

const setNotifications = (notifications: Notification[]): void => {
  localStorage.setItem('ct-notifications', JSON.stringify(notifications));
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotificationsState] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadNotifications = () => {
      const notifs = getNotifications();
      // Filter notifications for current user or global notifications
      const userNotifications = notifs.filter(n => 
        !n.userId || n.userId === user?.id
      );
      setNotificationsState(userNotifications);
    };

    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Auto-clear expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpired();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const notifs = getNotifications();
    const userNotifications = notifs.filter(n => 
      !n.userId || n.userId === user?.id
    );
    setNotificationsState(userNotifications);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      isRead: false,
    };

    const notifications = getNotifications();
    notifications.push(newNotification);
    setNotifications(notifications);
    refreshData();
  };

  const markAsRead = (id: string) => {
    const notifications = getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      notifications[index] = { ...notifications[index], isRead: true };
      setNotifications(notifications);
      refreshData();
    }
  };

  const markAllAsRead = () => {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(n => 
      (!n.userId || n.userId === user?.id) ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    refreshData();
  };

  const deleteNotification = (id: string) => {
    const notifications = getNotifications();
    const filteredNotifications = notifications.filter(n => n.id !== id);
    setNotifications(filteredNotifications);
    refreshData();
  };

  const clearExpired = () => {
    const notifications = getNotifications();
    const now = new Date();
    const validNotifications = notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );
    
    if (validNotifications.length !== notifications.length) {
      setNotifications(validNotifications);
      refreshData();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearExpired,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};