'use server';

import { getNotifications, markNotificationAsRead } from '@/services/notificationService';
import { PaginatedNotificationResponse, Notification } from '@/models/notification';

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Get notifications với pagination
 * @param page - Số trang (bắt đầu từ 1)
 * @param pageSize - Số lượng notifications mỗi trang
 */
export async function getNotificationsAction(
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResponse<PaginatedNotificationResponse>> {
  try {
    const response = await getNotifications(page, pageSize);

    if (!response) {
      return {
        success: false,
        error: 'Không thể lấy danh sách thông báo'
      };
    }

    if (response.data) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: response.message || 'Lỗi khi lấy danh sách thông báo'
    };
  } catch (error) {
    console.error('Get notifications error:', error);
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi lấy danh sách thông báo'
    };
  }
}

/**
 * Server Action: Mark notification as read
 * @param notificationId - ID của notification cần đánh dấu đã đọc
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<ActionResponse<Notification>> {
  try {
    const response = await markNotificationAsRead(notificationId);

    if (!response) {
      return {
        success: false,
        error: 'Không thể đánh dấu thông báo đã đọc'
      };
    }

    if (response.data) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: response.message || 'Lỗi khi đánh dấu thông báo đã đọc'
    };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi đánh dấu thông báo đã đọc'
    };
  }
}
