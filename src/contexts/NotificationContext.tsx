import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { playNotificationSound } from '@/utils/notificationSound';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

export interface NotificationItem {
  id: string;
  type: 'order' | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Allow simplified notification creation
export type NotificationData = {
  type: 'order' | 'system';
  title: string;
  message: string;
};

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  addNotification: (notification: NotificationItem | NotificationData) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  clearNotification: (id: string) => void;
  enableSounds: boolean;
  toggleSounds: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [enableSounds, setEnableSounds] = useState(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationCheck = useRef<string>(new Date().toISOString());
  const { toast } = useToast();

  // Helper function to check if user is admin
  const isAdminUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.role === 'admin';
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const soundsSetting = localStorage.getItem('admin_sounds_enabled');
        if (soundsSetting !== null) {
          setEnableSounds(JSON.parse(soundsSetting));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save sound setting to localStorage
  useEffect(() => {
    localStorage.setItem('admin_sounds_enabled', JSON.stringify(enableSounds));
  }, [enableSounds]);
  
  // Load notifications from localStorage on mount and listen for cross-tab updates
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem('admin_notifications');
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications) as NotificationItem[];
          setNotifications(parsedNotifications);
          console.log('NotificationContext: Loaded notifications from localStorage');
        }
      } catch (error) {
        console.error('NotificationContext: Error loading notifications from localStorage', error);
      }
    };
    
    // Load notifications on mount
    loadNotifications();
    
    // Listen for storage events from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'admin_notifications' && event.newValue) {
        try {
          const newNotifications = JSON.parse(event.newValue) as NotificationItem[];
          
          // Update notifications state
          setNotifications(newNotifications);
          console.log('NotificationContext: Updated notifications from storage event');
        } catch (error) {
          console.error('NotificationContext: Error processing storage event', error);
        }
      }
    };
    
    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array - only run on mount

  // Real-time notification polling (admin only)
  useEffect(() => {
    const fetchNewNotifications = async () => {
      // Only fetch notifications for admin users
      if (!isAdminUser()) {
        setIsConnected(false);
        return;
      }

      try {
        setIsConnected(true);
        const response = await api.get(`/notifications?since=${lastNotificationCheck.current}`);
        const newNotifications = response.data.notifications || [];
        
        if (newNotifications.length > 0) {
          console.log(`Received ${newNotifications.length} new notifications`);
          
          // Add new notifications
          newNotifications.forEach((notification: NotificationItem) => {
            const completeNotification: NotificationItem = {
              id: notification.id || `notification-${Date.now()}-${Math.random()}`,
              type: notification.type || 'system',
              title: notification.title,
              message: notification.message,
              createdAt: notification.createdAt || new Date().toISOString(),
              isRead: false
            };
            
            // Check if notification already exists
            setNotifications(prev => {
              const exists = prev.some(n => n.id === completeNotification.id);
              if (!exists) {
                 // Play sound for new notifications (admin only)
                 if (enableSounds && isAdminUser() && (notification.type === 'order' || notification.title.toLowerCase().includes('order'))) {
                   setTimeout(() => playNotificationSound(notification.type), 100);
                 }
                
                // Show toast notification (admin only)
                if (isAdminUser()) {
                  try {
                    toast({
                      title: completeNotification.title,
                      description: completeNotification.message,
                      duration: 5000,
                    });
                  } catch (toastError) {
                    console.error('Error showing toast:', toastError);
                  }
                }
                
                return [completeNotification, ...prev];
              }
              return prev;
            });
          });
          
          // Update last check time
          lastNotificationCheck.current = new Date().toISOString();
        }
        
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setIsConnected(false);
      }
    };

    // Start polling for notifications every 5 seconds (admin only)
    const startPolling = () => {
      if (isAdminUser()) {
        fetchNewNotifications(); // Initial fetch
        pollingInterval.current = setInterval(fetchNewNotifications, 5000);
      }
    };

    // Stop polling
    const stopPolling = () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };

    // Start polling when component mounts
    startPolling();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [enableSounds, toast]);

  // Note: localStorage saving is handled in addNotification function and other mutation methods
  // Removed the useEffect that was causing infinite loops by saving to localStorage on every change

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Add a new notification
  const addNotification = (notification: NotificationItem | NotificationData) => {
    // Ensure we have a complete NotificationItem
    const completeNotification: NotificationItem = 'id' in notification
      ? notification as NotificationItem
      : {
          ...notification,
          id: `notification-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          isRead: false
        };
    
    // Use functional update to check if notification already exists and add if not
    setNotifications(prev => {
      const exists = prev.some(n => n.id === completeNotification.id);
      
      if (!exists) {
        // ALWAYS store notification to admin localStorage (even if current user is not admin)
        try {
          const existingNotifications = localStorage.getItem('admin_notifications');
          const adminNotifications = existingNotifications ? JSON.parse(existingNotifications) : [];
          const notificationExists = adminNotifications.some((n: NotificationItem) => n.id === completeNotification.id);
          
          if (!notificationExists) {
            adminNotifications.unshift(completeNotification);
            localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
            console.log('Notification saved to admin localStorage:', completeNotification.title);
          }
        } catch (error) {
          console.error('Error saving notification to admin localStorage:', error);
        }
        
        // Play sound for order notifications (admin only)
        if (enableSounds && isAdminUser() && (completeNotification.type === 'order' || completeNotification.title.toLowerCase().includes('order'))) {
          setTimeout(() => playNotificationSound(completeNotification.type), 100);
        }
        
        // Show toast notification (admin only)
        if (isAdminUser()) {
          toast({
            title: completeNotification.title,
            description: completeNotification.message,
            duration: 5000,
          });
        }
        
        // NOTE: Removed manual storage event dispatch to prevent infinite loops
        // The storage event listener is meant for cross-tab communication only
        // Manual dispatch was causing same-tab infinite loops
        // Cross-tab updates will still work through natural localStorage changes
        
        return [completeNotification, ...prev];
      }
      
      return prev;
    });
  };

  // Toggle sound notifications
  const toggleSounds = () => {
    setEnableSounds(prev => !prev);
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
  };

  // Clear a specific notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        addNotification, 
        markAsRead,
        markAllAsRead,
        clearNotifications,
        clearNotification,
        enableSounds,
        toggleSounds
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
