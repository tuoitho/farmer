"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { AlertCircle, CheckCircle, Info, CloudRain, Bug } from "lucide-react";
import { getNotificationsAction, markNotificationAsReadAction } from "@/action/notification";
import { Notification, NotificationType } from "@/models/notification";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const pageSize = 20;

  // Load notifications from API
  useEffect(() => {
    loadNotifications(page);
  }, [page]);

  const loadNotifications = async (pageNum: number) => {
    setLoading(true);
    const result = await getNotificationsAction(pageNum, pageSize);
    
    if (result.success && result.data) {
      setNotifications(result.data.notifications);
      setTotalPages(result.data.total_pages);
      setUnreadCount(result.data.unread_count);
    } else {
      toast.error(result.error || 'Không thể tải thông báo');
    }
    setLoading(false);
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsReadAction(notificationId);
    
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read_status: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Đã đánh dấu đã đọc');
    } else {
      toast.error(result.error || 'Không thể đánh dấu đã đọc');
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.WEATHER_ALERT:
        return CloudRain;
      case NotificationType.DISEASE_DETECTED:
        return Bug;
      case NotificationType.DAILY_WEATHER_FORECAST:
        return Info;
      case NotificationType.SYSTEM:
        return CheckCircle;
      default:
        return Info;
    }
  };

  // Get background color based on notification type
  const getBgColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return "bg-gray-100";
    
    switch (type) {
      case NotificationType.WEATHER_ALERT:
        return "bg-[#ffd2d2]";
      case NotificationType.DISEASE_DETECTED:
        return "bg-[#ffd2d2]";
      case NotificationType.DAILY_WEATHER_FORECAST:
        return "bg-[#d4e8ff]";
      case NotificationType.SYSTEM:
        return "bg-[#b5d5b1]";
      default:
        return "bg-[#d4e8ff]";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
      <Sidebar activePage="notifications" />

      <div className="flex flex-[1_0_0] flex-col gap-[25px] md:gap-[30px] items-center min-h-screen w-full max-w-full relative pb-20 md:pb-8 overflow-x-hidden md:ml-[60px] lg:ml-[72px]">
        <div className="box-border flex flex-col gap-[18px] md:gap-[22px] items-center justify-center px-[20px] md:px-[40px] lg:px-[60px] py-0 relative shrink-0 w-full max-w-full pt-6 md:pt-8">
          <div className="bg-transparent h-[50px] md:h-[60px] shrink-0 w-full" />
          <div className="flex items-center justify-center gap-3 w-full">
            <p className="capitalize font-['Montserrat'] font-semibold leading-[normal] relative shrink-0 text-[28px] md:text-[36px] text-black text-center">
              Thông Báo
            </p>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[14px] md:text-[16px] font-['Be_Vietnam_Pro'] font-semibold px-3 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && notifications.length === 0 ? (
            <div className="flex justify-center items-center py-20 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e8623]"></div>
            </div>
          ) : (
            <>
              {/* Notifications List */}
              <div className="flex flex-col gap-[15px] md:gap-[20px] items-start relative shrink-0 w-full max-w-[900px]">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const bgColor = getBgColor(notification.type, notification.read_status);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`${bgColor} box-border flex gap-[15px] md:gap-[20px] items-start px-[20px] md:px-[30px] py-[18px] md:py-[25px] relative rounded-[18px] shrink-0 w-full hover:shadow-md transition-shadow cursor-pointer ${
                        !notification.read_status ? 'border-2 border-[#2e8623]' : ''
                      }`}
                      onClick={() => !notification.read_status && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-center pt-1 shrink-0">
                        <Icon className="size-[24px] md:size-[30px] text-[#191f19]" />
                      </div>
                      <div className="flex flex-col gap-[8px] md:gap-[10px] flex-1">
                        <div className="flex items-start justify-between gap-3 w-full">
                          <p className="font-['Be_Vietnam_Pro'] font-semibold leading-[1.3] text-[18px] md:text-[22px] text-black flex-1">
                            {notification.type === NotificationType.WEATHER_ALERT && "Cảnh Báo Thời Tiết"}
                            {notification.type === NotificationType.DISEASE_DETECTED && "Phát Hiện Bệnh"}
                            {notification.type === NotificationType.DAILY_WEATHER_FORECAST && "Dự Báo Thời Tiết"}
                            {notification.type === NotificationType.SYSTEM && "Thông Báo Hệ Thống"}
                          </p>
                          <p className="font-['Be_Vietnam_Pro'] leading-[normal] text-[12px] md:text-[14px] text-black opacity-60 shrink-0">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        <p className="font-['Be_Vietnam_Pro'] leading-[1.5] text-[14px] md:text-[16px] text-black">
                          {notification.message}
                        </p>
                        {!notification.read_status && (
                          <p className="font-['Be_Vietnam_Pro'] text-[12px] md:text-[14px] text-[#2e8623] font-semibold mt-1">
                            Nhấn để đánh dấu đã đọc
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4 w-full">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-[#2e8623] text-white font-['Be_Vietnam_Pro'] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#256d1c] transition-colors"
                  >
                    Trước
                  </button>
                  <span className="font-['Be_Vietnam_Pro'] text-[16px] text-black">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-[#2e8623] text-white font-['Be_Vietnam_Pro'] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#256d1c] transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}

              {/* Empty State (when no notifications) */}
              {notifications.length === 0 && !loading && (
                <div className="flex flex-col gap-[20px] items-center justify-center py-[80px] w-full">
                  <div className="opacity-30">
                    <Info className="size-[80px] text-[#2e8623]" />
                  </div>
                  <p className="font-['Be_Vietnam_Pro'] font-semibold text-[20px] md:text-[24px] text-black text-center">
                    Không có thông báo nào
                  </p>
                  <p className="font-['Be_Vietnam_Pro'] text-[16px] md:text-[18px] text-black text-center opacity-60">
                    Bạn sẽ nhận được thông báo khi có cập nhật mới
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
