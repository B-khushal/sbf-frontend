import React, { useState, useEffect } from 'react';
import { 
  EnhancedContextualDialog, 
  EnhancedContextualDialogContent, 
  EnhancedContextualDialogHeader, 
  EnhancedContextualDialogTitle 
} from '@/components/ui/enhanced-contextual-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, X, Trash2, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getNotifications, getNotificationStats, deleteNotification } from '@/services/notificationService';
import { getSessionId } from '@/utils/sessionManager';
import { useToast } from '@/hooks/use-toast';

interface NotificationItem {
  id: string;
  type: 'order' | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isHidden?: boolean;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

interface NotificationHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  open,
  onOpenChange
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const { toast } = useToast();

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      
      // Fetch all notifications (history mode)
      const notificationsResponse = await getNotifications(undefined, true, sessionId);
      const statsResponse = await getNotificationStats();
      
      console.log('Notification history response:', notificationsResponse);
      
      // Fix: getNotifications returns the notifications array directly, not wrapped
      setNotifications(Array.isArray(notificationsResponse) ? notificationsResponse : []);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHistoryData();
    }
  }, [open]);

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      toast({
        title: "Success",
        description: "Notification deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error", 
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read') return notification.isRead;
    if (filter === 'unread') return !notification.isRead;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <EnhancedContextualDialog open={open} onOpenChange={onOpenChange}>
      <EnhancedContextualDialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <EnhancedContextualDialogHeader>
          <EnhancedContextualDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification History
            {stats && (
              <Badge variant="outline" className="ml-2">
                {stats.total} total
              </Badge>
            )}
          </EnhancedContextualDialogTitle>
        </EnhancedContextualDialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                <div className="text-sm text-muted-foreground">Unread</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.read}</div>
                <div className="text-sm text-muted-foreground">Read</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.isRead).length})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read ({notifications.filter(n => n.isRead).length})
            </Button>
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No notifications found</p>
                <p className="text-xs">
                  {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notification.isRead
                        ? 'bg-muted/20 border-muted'
                        : 'bg-blue-50 border-blue-200'
                    } ${notification.isHidden ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">{getTypeIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Badge
                              className={`text-xs ${getTypeColor(notification.type)}`}
                              variant="secondary"
                            >
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="text-xs">
                                Unread
                              </Badge>
                            )}
                            {notification.isHidden && (
                              <Badge variant="outline" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground text-right">
                          <div>
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true
                            })}
                          </div>
                          <div>
                            {new Date(notification.createdAt).toLocaleDateString()} {' '}
                            {new Date(notification.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </EnhancedContextualDialogContent>
    </EnhancedContextualDialog>
  );
};

export default NotificationHistoryModal; 