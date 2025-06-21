import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, Trash2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { getNotifications } from '@/services/notificationService';
import api from '@/services/api';

const AdminNavbar = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    isConnected,
    syncNotifications,
    lastSyncTime
  } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    // Fetch notifications when component mounts
    const fetchNotifications = async () => {
      try {
        await getNotifications();
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncNotifications();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      if (isConnected) {
        // If online, try to create via API
        const response = await api.post('/notifications/test');
        console.log('Test notification created:', response.data);
        
        // Trigger sync to show the new notification
        await syncNotifications();
      } else {
        // If offline, create a local test notification
        const testNotification = {
          id: `test-${Date.now()}`,
          type: 'order' as const,
          title: '🧪 Test Order Notification',
          message: `Sample order #TEST-${Date.now().toString().slice(-6)} placed for testing. Amount: ₹1,299`,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        
        // Add to localStorage
        const existingNotifications = localStorage.getItem('admin_notifications');
        const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
        notifications.unshift(testNotification);
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        
        // Trigger a storage event to update the context
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'admin_notifications',
          newValue: JSON.stringify(notifications),
          oldValue: existingNotifications
        }));
        
        console.log('Test notification created in offline mode');
      }
    } catch (error) {
      console.error('Failed to create test notification:', error);
      
      // Fallback to offline mode even if API call fails
      const testNotification = {
        id: `test-fallback-${Date.now()}`,
        type: 'order' as const,
        title: '🧪 Test Notification (Offline)',
        message: `Offline test notification created at ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      const existingNotifications = localStorage.getItem('admin_notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      notifications.unshift(testNotification);
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'admin_notifications',
        newValue: JSON.stringify(notifications),
        oldValue: existingNotifications
      }));
    }
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div 
                className="flex items-center gap-1 text-green-600 cursor-pointer"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                title="Click for connection info"
              >
                <Wifi className="h-4 w-4" />
                <span className="text-xs font-medium">Online</span>
              </div>
            ) : (
              <div 
                className="flex items-center gap-1 text-orange-600 cursor-pointer"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                title="Click for debug info"
              >
                <WifiOff className="h-4 w-4" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
            
            {/* Debug/Info Popup */}
            {showDebugInfo && (
              <div className="absolute top-16 right-4 bg-white border rounded-lg shadow-lg p-4 z-50 w-80">
                <div className="text-sm space-y-2">
                  {isConnected ? (
                    <>
                      <div className="font-semibold text-green-600">✅ Connection Active</div>
                      <div><strong>Status:</strong> Backend Online</div>
                      <div><strong>Backend URL:</strong> https://sbf-backend.onrender.com</div>
                      <div><strong>Mode:</strong> Live (MongoDB + API)</div>
                      <div><strong>Notifications:</strong> {notifications.length} loaded</div>
                      {lastSyncTime && (
                        <div><strong>Last Sync:</strong> {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}</div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-600">
                          <strong>Features Available:</strong><br/>
                          ✅ Real-time order notifications<br/>
                          ✅ Cross-device synchronization<br/>
                          ✅ API test notifications<br/>
                          ✅ MongoDB persistence
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-red-600">❌ Connection Debug Info</div>
                      <div><strong>Status:</strong> Backend Unavailable</div>
                      <div><strong>Issue:</strong> CORS Policy Error</div>
                      <div><strong>Solution:</strong> Backend needs redeployment</div>
                      <div><strong>Backend URL:</strong> https://sbf-backend.onrender.com</div>
                      <div><strong>Current Mode:</strong> Offline (localStorage)</div>
                      <div><strong>Notifications:</strong> {notifications.length} loaded locally</div>
                      {lastSyncTime && (
                        <div><strong>Last Sync:</strong> {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}</div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-600">
                          <strong>Steps to fix:</strong><br/>
                          1. Go to Render Dashboard<br/>
                          2. Redeploy sbf-backend service<br/>
                          3. Wait for deployment to complete<br/>
                          4. Click "Sync" button to reconnect
                        </div>
                      </div>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setShowDebugInfo(false)}
                    className="w-full mt-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Test Notification Button (for debugging) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestNotification}
            className="text-xs"
          >
            Test
          </Button>

          {/* Sync Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="text-xs"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Button>

          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {unreadCount > 0 ? (
                  <BellRing className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex flex-col">
                  <h3 className="font-medium">Notifications</h3>
                  {lastSyncTime && (
                    <span className="text-xs text-muted-foreground">
                      Last sync: {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsRead()}
                    >
                      Mark all as read
                    </Button>
                  )}
                  {notifications.some(n => n.isRead) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Clear read notifications
                        notifications.filter(n => n.isRead).forEach(n => clearNotification(n.id));
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      Clear read
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-4 border-b cursor-pointer ${
                        !notification.isRead ? 'bg-secondary/20' : ''
                      }`}
                    >
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex items-start justify-between">
                          <span className="font-medium">{notification.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="self-start"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 