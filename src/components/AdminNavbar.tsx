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

const AdminNavbar = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearReadNotifications,
    isConnected,
    syncNotifications,
    lastSyncTime,
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
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

  return (
    <nav className="border-b">
      <div className="flex min-h-16 items-center px-3 sm:px-4">
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600" title="Connected">
                <Wifi className="h-4 w-4" />
                <span className="text-xs font-medium">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-orange-600" title="Offline mode">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs font-medium">Offline</span>
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="text-xs px-2 sm:px-3"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
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
            <DropdownMenuContent align="end" className="w-[calc(100vw-1rem)] sm:w-80 max-w-80">
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
                      onClick={async () => await markAllAsRead()}
                    >
                      Mark all as read
                    </Button>
                  )}
                  {notifications.some((n) => n.isRead) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (clearReadNotifications) {
                          await clearReadNotifications();
                        }
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
                  <div className="p-4 text-center text-muted-foreground">No notifications</div>
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
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="self-start"
                            onClick={async () => await markAsRead(notification.id)}
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
