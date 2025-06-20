import api from './api';

export interface Notification {
  id: string;
  type: 'order' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationResponse {
  id: string;
  type: 'order' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Get all notifications
export const getNotifications = async () => {
  const response = await api.get<{ notifications: NotificationResponse[] }>('/notifications');
  return response.data.notifications.map((n) => ({
    ...n,
    createdAt: new Date(n.createdAt)
  }));
};

// Mark notification as read
export const markAsRead = async (id: string) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

// Clear read notifications
export const clearReadNotifications = async () => {
  const response = await api.delete('/notifications/read');
  return response.data;
};

// Delete a notification
export const deleteNotification = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
}; 