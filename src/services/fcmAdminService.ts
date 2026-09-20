import api from './api';

export interface AdminDeviceUser {
  id: string | null;
  name: string;
  email: string;
  role: string;
}

export interface AdminDevice {
  id: string;
  deviceType: 'android' | 'ios' | 'web' | string;
  deviceInfo?: {
    platform?: string;
    model?: string;
    appVersion?: string;
    deviceId?: string;
    osVersion?: string;
    [key: string]: any;
  };
  lastUsed: string;
  createdAt: string;
  isActive: boolean;
  tokenPreview: string;
  user: AdminDeviceUser;
}

export interface FCMStatus {
  initialized: boolean;
  hasCredentials: boolean;
  projectId: string;
  clientEmail: string;
  timestamp: string;
}

export interface TestNotificationPayload {
  title: string;
  body: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  amount?: string;
  type?: string;
  data?: Record<string, string>;
}

export interface DeliveryRecipientResult {
  deviceId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  deviceType: string;
  tokenPreview: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TestNotificationResponse {
  success: boolean;
  message: string;
  data: {
    total?: number;
    sent?: number;
    failed?: number;
    recipients?: DeliveryRecipientResult[];
    messageId?: string;
    deviceType?: string;
    sentAt?: string;
    recipient?: string;
    email?: string;
    tokenPreview?: string;
  };
}

/**
 * Fetch all registered admin devices that receive notifications
 */
export const getAdminDevices = async (): Promise<AdminDevice[]> => {
  const response = await api.get<{ success: boolean; count: number; data: AdminDevice[] }>(
    '/device-tokens/admin-devices'
  );
  return response.data?.data || [];
};

/**
 * Check Firebase Cloud Messaging service status and configuration
 */
export const getFCMStatus = async (): Promise<{ success: boolean; fcm: FCMStatus; message: string }> => {
  const response = await api.get<{ success: boolean; fcm: FCMStatus; message: string }>(
    '/device-tokens/fcm-status'
  );
  return response.data;
};

/**
 * Send test push notification to ALL registered admin devices
 */
export const sendTestNotificationToAll = async (
  payload: TestNotificationPayload
): Promise<TestNotificationResponse> => {
  const response = await api.post<TestNotificationResponse>(
    '/device-tokens/test-all',
    payload
  );
  return response.data;
};

/**
 * Send test push notification to a specific admin device by its ID
 */
export const sendTestNotificationToDevice = async (
  deviceId: string,
  payload: TestNotificationPayload
): Promise<TestNotificationResponse> => {
  const response = await api.post<TestNotificationResponse>(
    '/device-tokens/test-by-id',
    {
      deviceId,
      ...payload
    }
  );
  return response.data;
};

/**
 * Deactivate an invalid or stale device token
 */
export const deactivateDeviceToken = async (deviceId: string) => {
  const response = await api.put(`/device-tokens/${deviceId}/deactivate`);
  return response.data;
};

/**
 * Delete a device token from the system
 */
export const deleteDeviceToken = async (deviceId: string) => {
  const response = await api.delete(`/device-tokens/${deviceId}`);
  return response.data;
};

/**
 * Clean up old inactive tokens (older than 90 days)
 */
export const cleanupOldTokens = async () => {
  const response = await api.post<{ success: boolean; message: string; data: { deletedCount: number } }>(
    '/device-tokens/cleanup'
  );
  return response.data;
};
