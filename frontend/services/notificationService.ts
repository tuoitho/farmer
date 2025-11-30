/**
 * Notification Service
 * Xử lý các API calls liên quan đến notifications
 */

import apiConfig from '@/common/config/api';
import { PaginatedNotificationResponse, Notification } from '@/models/notification';
import { TResponseData } from '@/models/global';
import useApiGet from './useApiGet';
import useApiPut from './useApiPut';

/**
 * Get notifications với pagination
 * @param page - Số trang (bắt đầu từ 1)
 * @param pageSize - Số lượng notifications mỗi trang (default: 20, max: 100)
 */
export const getNotifications = async (
  page: number = 1,
  pageSize: number = 20
): Promise<TResponseData<PaginatedNotificationResponse> | undefined> => {
  return useApiGet<PaginatedNotificationResponse>(
    apiConfig.Notification.getNotifications,
    { page, page_size: pageSize }
  );
};

/**
 * Mark notification as read
 * @param notificationId - ID của notification cần đánh dấu đã đọc
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<TResponseData<Notification> | undefined> => {
  const url = apiConfig.Notification.updateNotification.replace(':notificationId', notificationId);
  return useApiPut(url, { is_read: true }) as Promise<TResponseData<Notification> | undefined>;
};
