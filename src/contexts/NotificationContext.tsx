import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { useDatabase } from '../hooks/useDatabase';
import { SupabaseNotificationService } from '../services/supabaseNotificationService';

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
  const { isConnected, useLocalMode } = useDatabase();

  useEffect(() => {
    const loadNotifications = () => {
      if (useLocalMode) {
        const notifs = getNotifications();
        const userNotifications = notifs.filter(n => 
          !n.userId || n.userId === user?.id
        );
        setNotificationsState(userNotifications);
      } else if (isConnected && user) {
        loadSupabaseNotifications();
      }
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

  const loadSupabaseNotifications = async () => {
    try {
      const notifs = await SupabaseNotificationService.findByUserId(user?.id);
      setNotificationsState(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  const refreshData = () => {
    if (useLocalMode) {
      const notifs = getNotifications();
      const userNotifications = notifs.filter(n => 
        !n.userId || n.userId === user?.id
      );
      setNotificationsState(userNotifications);
    } else if (isConnected) {
      loadSupabaseNotifications();
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      if (useLocalMode) {
        const newNotification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          createdAt: new Date(),
          isRead: false,
        };

        const notifications = getNotifications();
        notifications.push(newNotification);
        setNotifications(notifications);
      } else {
        await SupabaseNotificationService.createNotification({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          user_id: notificationData.userId,
          expires_at: notificationData.expiresAt?.toISOString(),
        });
      }
      refreshData();
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      if (useLocalMode) {
        const notifications = getNotifications();
        const index = notifications.findIndex(n => n.id === id);
        
        if (index !== -1) {
          notifications[index] = { ...notifications[index], isRead: true };
          setNotifications(notifications);
        }
      } else {
        await SupabaseNotificationService.markAsRead(id);
      }
      refreshData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (useLocalMode) {
        const notifications = getNotifications();
        const updatedNotifications = notifications.map(n => 
          (!n.userId || n.userId === user?.id) ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
      } else if (user) {
        await SupabaseNotificationService.markAllAsRead(user.id);
      }
      refreshData();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      if (useLocalMode) {
        const notifications = getNotifications();
        const filteredNotifications = notifications.filter(n => n.id !== id);
        setNotifications(filteredNotifications);
      } else {
        await SupabaseNotificationService.deleteNotification(id);
      }
      refreshData();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearExpired = async () => {
    try {
      if (useLocalMode) {
        const notifications = getNotifications();
        const now = new Date();
        const validNotifications = notifications.filter(n => 
          !n.expiresAt || n.expiresAt > now
        );
        
        if (validNotifications.length !== notifications.length) {
          setNotifications(validNotifications);
          refreshData();
        }
      } else {
        await SupabaseNotificationService.deleteExpired();
      }
      refreshData();
    } catch (error) {
      console.error('Error clearing expired notifications:', error);
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