import { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { playNotificationSound } from '@/utils/notificationSound';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { getSessionId } from '@/utils/sessionManager';

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
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  clearReadNotifications: () => Promise<void>;
  clearNotification: (id: string) => void;
  enableSounds: boolean;
  toggleSounds: () => void;
  syncNotifications: () => Promise<void>;
  lastSyncTime: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [enableSounds, setEnableSounds] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize lastNotificationCheck to 24 hours ago to catch recent notifications
  const get24HoursAgo = () => {
    const now = new Date();
    now.setHours(now.getHours() - 24);
    return now.toISOString();
  };
  const lastNotificationCheck = useRef<string>(get24HoursAgo());
  const { toast } = useToast();

  const MAX_RETRIES = 3;

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
          
          // Notifications loaded from storage (removed offline mode toast)
          if (parsedNotifications.length > 0) {
            console.log(`Loaded ${parsedNotifications.length} notifications from local storage`);
          }
        } else {
          // If no stored notifications and user is admin, create a welcome notification
          if (isAdminUser()) {
            const welcomeNotification: NotificationItem = {
              id: `welcome-${Date.now()}`,
              type: 'system',
              title: '👋 Welcome to SBF Admin',
              message: 'Notification system is ready. Order notifications will appear here when customers place orders.',
              createdAt: new Date().toISOString(),
              isRead: false
            };
            
            setNotifications([welcomeNotification]);
            localStorage.setItem('admin_notifications', JSON.stringify([welcomeNotification]));
            console.log('Created welcome notification for new admin');
          }
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
        console.log('Fetching notifications from API...');
        const response = await api.get(`/notifications?since=${lastNotificationCheck.current}`);
        
        // Validate response structure
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response format from notifications API');
        }
        
        const newNotifications = response.data.notifications || [];
        
        if (newNotifications.length > 0) {
          console.log(`Received ${newNotifications.length} new notifications from API`);
          
          // Add new notifications
          newNotifications.forEach((notification: any) => {
            // Validate notification data
            if (!notification || typeof notification !== 'object') {
              console.warn('Invalid notification object received:', notification);
              return;
            }
            
            const completeNotification: NotificationItem = {
              id: notification.id || `notification-${Date.now()}-${Math.random()}`,
              type: notification.type || 'system',
              title: notification.title || 'Untitled Notification',
              message: notification.message || 'No message available',
              createdAt: notification.createdAt || new Date().toISOString(),
              isRead: notification.isRead || false
            };
            
            // Check if notification already exists
            setNotifications(prev => {
              const exists = prev.some(n => n.id === completeNotification.id);
              if (!exists) {
                 // Play sound for new notifications (admin only)
                 if (enableSounds && isAdminUser() && (notification.type === 'order' || completeNotification.title.toLowerCase().includes('order'))) {
                   try {
                     setTimeout(() => playNotificationSound(notification.type || 'default'), 100);
                   } catch (soundError) {
                     console.error('Error playing notification sound:', soundError);
                   }
                 }
                
                // Show toast notification (admin only)
                if (isAdminUser()) {
                  try {
                    // Ensure toast properties are valid
                    const safeTitle = completeNotification.title || 'New Notification';
                    const safeMessage = completeNotification.message || 'You have a new notification';
                    
                    toast({
                      title: safeTitle,
                      description: safeMessage,
                      duration: 5000,
                    });
                  } catch (toastError) {
                    console.error('Error showing toast notification:', toastError);
                  }
                }
                
                return [completeNotification, ...prev];
              }
              return prev;
            });
          });
          
          // Update last check time to the most recent notification's timestamp
          // This ensures we don't miss any notifications created between polling intervals
          const mostRecentTimestamp = Math.max(
            ...newNotifications.map((n: any) => new Date(n.createdAt || 0).getTime())
          );
          if (mostRecentTimestamp > 0) {
            lastNotificationCheck.current = new Date(mostRecentTimestamp).toISOString();
          } else {
            lastNotificationCheck.current = new Date().toISOString();
          }
        } else {
          // No new notifications, update check time to now
          lastNotificationCheck.current = new Date().toISOString();
        }
        
        // Connection successful - reset retry counter and show success message if was previously offline
        if (connectionRetries > 0) {
          console.log('Backend connection restored after', connectionRetries, 'retries');
          toast({
            title: "Connection Restored! 🎉",
            description: "Successfully reconnected to backend server. Notifications are now live.",
            duration: 4000,
          });
        }
        
        setConnectionRetries(0);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch notifications from API:', error);
        setIsConnected(false);
        
        // Increment retry counter
        setConnectionRetries(prev => prev + 1);
        
        // Show user-friendly error message based on error type
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin')) {
          console.log('CORS error detected - backend needs to be redeployed with updated CORS configuration');
          
          // Show CORS error toast only once every 10 retries to avoid spam
          if (connectionRetries % 10 === 0) {
            toast({
              title: "Backend Connection Issue",
              description: "The backend server needs to be redeployed. Using offline mode until connection is restored.",
              duration: 8000,
            });
          }
        } else if (errorMessage.includes('ERR_NETWORK') || errorMessage.includes('ERR_FAILED')) {
          console.log('Network error detected - backend might be down or restarting');
          
          if (connectionRetries % 10 === 0) {
            toast({
              title: "Server Unavailable", 
              description: "Backend server is temporarily unavailable. Retrying connection...",
              duration: 5000,
            });
          }
        }
        
        // Fallback: Load notifications from localStorage if API fails
        try {
          const storedNotifications = localStorage.getItem('admin_notifications');
          if (storedNotifications) {
            const localNotifications = JSON.parse(storedNotifications) as NotificationItem[];
            
            // Check for new notifications since last check that might be in localStorage
            const newLocalNotifications = localNotifications.filter(n => 
              new Date(n.createdAt) > new Date(lastNotificationCheck.current)
            );
            
            if (newLocalNotifications.length > 0) {
              console.log(`Found ${newLocalNotifications.length} new notifications in localStorage`);
              
              newLocalNotifications.forEach((notification) => {
                // Validate notification from localStorage
                if (!notification || typeof notification !== 'object' || !notification.id) {
                  console.warn('Invalid notification in localStorage:', notification);
                  return;
                }
                
                setNotifications(prev => {
                  const exists = prev.some(n => n.id === notification.id);
                  if (!exists) {
                    // Play sound for new notifications (admin only)
                    if (enableSounds && isAdminUser() && (notification.type === 'order' || notification.title?.toLowerCase().includes('order'))) {
                      try {
                        setTimeout(() => playNotificationSound(notification.type || 'default'), 100);
                      } catch (soundError) {
                        console.error('Error playing notification sound from localStorage:', soundError);
                      }
                    }
                    
                    // Show toast notification (admin only)
                    if (isAdminUser()) {
                      try {
                        // Ensure toast properties are valid
                        const safeTitle = notification.title || 'New Notification';
                        const safeMessage = notification.message || 'You have a new notification';
                        
                        toast({
                          title: safeTitle,
                          description: safeMessage,
                          duration: 5000,
                        });
                      } catch (toastError) {
                        console.error('Error showing toast notification from localStorage:', toastError);
                      }
                    }
                    
                    return [notification, ...prev];
                  }
                  return prev;
                });
              });
              
              // Update last check time
              lastNotificationCheck.current = new Date().toISOString();
            }
          }
        } catch (localStorageError) {
          console.error('Error loading notifications from localStorage:', localStorageError);
        }
      }
    };

    // Start polling for notifications every 5 seconds (admin only)
    const startPolling = () => {
      if (isAdminUser()) {
        fetchNewNotifications(); // Initial fetch
        pollingInterval.current = setInterval(fetchNewNotifications, 5000);
        console.log('Started notification polling for admin user');
      }
    };

    // Stop polling
    const stopPolling = () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        console.log('Stopped notification polling');
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
          let adminNotifications = [];
          
          if (existingNotifications) {
            try {
              adminNotifications = JSON.parse(existingNotifications);
              // Validate parsed data is an array
              if (!Array.isArray(adminNotifications)) {
                console.warn('Invalid admin_notifications format in localStorage, resetting to empty array');
                adminNotifications = [];
              }
            } catch (parseError) {
              console.error('Error parsing admin_notifications from localStorage:', parseError);
              adminNotifications = [];
            }
          }
          
          const notificationExists = adminNotifications.some((n: NotificationItem) => n.id === completeNotification.id);
          
          if (!notificationExists) {
            adminNotifications.unshift(completeNotification);
            // Limit to 100 notifications to prevent localStorage from growing too large
            if (adminNotifications.length > 100) {
              adminNotifications = adminNotifications.slice(0, 100);
            }
            localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
            console.log('Notification saved to admin localStorage:', completeNotification.title);
          }
        } catch (error) {
          console.error('Error saving notification to admin localStorage:', error);
        }
        
        // Play sound for order notifications (admin only)
        if (enableSounds && isAdminUser() && (completeNotification.type === 'order' || completeNotification.title.toLowerCase().includes('order'))) {
          try {
            setTimeout(() => playNotificationSound(completeNotification.type), 100);
          } catch (soundError) {
            console.error('Error playing notification sound for new notification:', soundError);
          }
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
  const markAsRead = async (id: string) => {
    try {
      // Call backend API
      await api.put(`/notifications/${id}/read`);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Update localStorage
      const storedNotifications = localStorage.getItem('admin_notifications');
      if (storedNotifications) {
        try {
          const adminNotifications = JSON.parse(storedNotifications);
          const updatedNotifications = adminNotifications.map((n: NotificationItem) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
        } catch (localStorageError) {
          console.error('Error updating localStorage after marking as read:', localStorageError);
        }
      }
      
      console.log(`✅ Notification ${id} marked as read`);
    } catch (error) {
      console.error(`❌ Error marking notification ${id} as read:`, error);
      // Don't show toast for individual read errors to avoid spam
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Call backend API
      await api.put('/notifications/read-all');
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Update localStorage
      const storedNotifications = localStorage.getItem('admin_notifications');
      if (storedNotifications) {
        try {
          const adminNotifications = JSON.parse(storedNotifications);
          const updatedNotifications = adminNotifications.map((n: NotificationItem) => ({
            ...n,
            isRead: true
          }));
          localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
        } catch (localStorageError) {
          console.error('Error updating localStorage after marking all as read:', localStorageError);
        }
      }
      
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
  };
  
  // Clear read notifications (backend integrated)
  const clearReadNotifications = async () => {
    try {
      const sessionId = getSessionId(); // Use proper session ID
      
      // Call backend API
      await api.delete('/notifications/read', { 
        data: { sessionId } 
      });
      
      // Remove read notifications from local state
      setNotifications(prev => prev.filter(notification => !notification.isRead));
      
      // Update localStorage to remove read notifications
      const storedNotifications = localStorage.getItem('admin_notifications');
      if (storedNotifications) {
        try {
          const adminNotifications = JSON.parse(storedNotifications);
          const unreadNotifications = adminNotifications.filter((n: NotificationItem) => !n.isRead);
          localStorage.setItem('admin_notifications', JSON.stringify(unreadNotifications));
        } catch (localStorageError) {
          console.error('Error updating localStorage after clearing read notifications:', localStorageError);
        }
      }
      
      console.log('✅ Read notifications cleared');
      toast({
        title: "Success",
        description: "Read notifications have been cleared",
      });
    } catch (error) {
      console.error('❌ Error clearing read notifications:', error);
      toast({
        title: "Error",
        description: "Failed to clear read notifications",
        variant: "destructive"
      });
    }
  };

  // Clear a specific notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Manual sync function for debugging and force refresh
  const syncNotifications = async () => {
    if (!isAdminUser()) {
      console.log('Sync skipped: User is not admin');
      return;
    }

    console.log('Manual notification sync initiated...');
    
    try {
      // Try to fetch from API first
      const response = await api.get('/notifications');
      const apiNotifications = response.data.notifications || [];
      
      if (apiNotifications.length > 0) {
        console.log(`Synced ${apiNotifications.length} notifications from API`);
        
        const formattedNotifications: NotificationItem[] = apiNotifications.map((n: any) => ({
          id: n.id || `api-${Date.now()}-${Math.random()}`,
          type: n.type || 'system',
          title: n.title,
          message: n.message,
          createdAt: n.createdAt || new Date().toISOString(),
          isRead: n.isRead || false
        }));
        
        setNotifications(formattedNotifications);
        setIsConnected(true);
        setLastSyncTime(new Date().toISOString());
        
        // Update localStorage with synced notifications
        localStorage.setItem('admin_notifications', JSON.stringify(formattedNotifications));
        
        // Reset retry counter since sync was successful
        setConnectionRetries(0);
        
        toast({
          title: "Notifications Synced",
          description: `Successfully synced ${apiNotifications.length} notifications from server`,
          duration: 3000,
        });
      } else {
        console.log('No notifications found on server');
        setIsConnected(true);
        setLastSyncTime(new Date().toISOString());
        
        // Reset retry counter since connection was successful
        setConnectionRetries(0);
        
        toast({
          title: "Sync Complete", 
          description: "No new notifications found on server",
          duration: 3000,
        });
      }
    } catch (apiError) {
      console.error('API sync failed, falling back to localStorage:', apiError);
      setIsConnected(false);
      
      // Fallback to localStorage
      try {
        const storedNotifications = localStorage.getItem('admin_notifications');
        if (storedNotifications) {
          const localNotifications = JSON.parse(storedNotifications) as NotificationItem[];
          setNotifications(localNotifications);
          setLastSyncTime(new Date().toISOString());
          
          console.log(`Fallback: Loaded ${localNotifications.length} notifications from local storage`);
        } else {
          toast({
            title: "Sync Failed",
            description: "Cannot connect to server and no local notifications found",
            duration: 5000,
          });
        }
      } catch (localError) {
        console.error('localStorage fallback failed:', localError);
        toast({
          title: "Error",
          description: "Failed to load notifications from both server and local storage",
          duration: 5000,
        });
      }
    }
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
      clearReadNotifications,
      clearNotification,
        enableSounds,
        toggleSounds,
        syncNotifications,
        lastSyncTime
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
