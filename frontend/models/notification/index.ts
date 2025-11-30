/**
 * Notification Models
 * Khớp với Backend Response từ NAVER-FARMER/backend/app/models/notification.py
 */

export enum NotificationType {
    WEATHER_ALERT = "weather_alert",
    DISEASE_DETECTED = "disease_detected",
    DAILY_WEATHER_FORECAST = "daily_weather_forecast",
    SYSTEM = "system"
}

export interface Notification {
    id: string;
    user_id: string;
    message: string;
    type: NotificationType;
    read_status: boolean;
    created_at: string; // ISO datetime string
}

export interface PaginatedNotificationResponse {
    notifications: Notification[];
    total: number;
    unread_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}
