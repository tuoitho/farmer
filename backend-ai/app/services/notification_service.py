from datetime import datetime
from typing import List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.models.notification import (
    NotificationInDB,
    NotificationCreate,
    NotificationResponse,
    NotificationType
)


class NotificationService:
    """Service for managing notification operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.notifications
    
    async def create_notification(self, notification_data: NotificationCreate) -> NotificationResponse:
        """
        Create a new notification
        
        Args:
            notification_data: Notification creation data
            
        Returns:
            NotificationResponse: Created notification data
        """
        notification_dict = notification_data.model_dump()
        
        # Ensure user_id is an ObjectId before saving, as model_dump() serializes it to a string
        if "user_id" in notification_dict and isinstance(notification_dict["user_id"], str):
            notification_dict["user_id"] = ObjectId(notification_dict["user_id"])

        notification_dict["read_status"] = False
        notification_dict["created_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(notification_dict)
        
        # Retrieve the created notification
        created_notification = await self.collection.find_one({"_id": result.inserted_id})
        
        return self._notification_to_response(created_notification)
    
    async def create_disease_notification(
        self, 
        user_id: str, 
        disease_name: str, 
        farm_name: str = None
    ) -> NotificationResponse:
        """
        Helper method to create a disease detection notification
        
        Args:
            user_id: ID of the user to notify (as string)
            disease_name: Name of the detected disease
            farm_name: Optional farm name for context
            
        Returns:
            NotificationResponse: Created notification data
            
        Usage in DiagnosisService:
            notification_service = NotificationService(self.db)
            await notification_service.create_disease_notification(
                user_id=user_id,
                disease_name=diagnosis_result["disease_name"],
                farm_name=farm.name
            )
        """
        farm_context = f" tại nông trại '{farm_name}'" if farm_name else ""
        message = f"Phát hiện bệnh: {disease_name}{farm_context}. Vui lòng kiểm tra chẩn đoán để xem các khuyến nghị."
        
        notification_data = NotificationCreate(
            user_id=ObjectId(user_id),
            message=message,
            type=NotificationType.DISEASE_DETECTED
        )
        
        return await self.create_notification(notification_data)
    
    async def create_weather_alert_notification(
        self, 
        user_id: str, 
        alert_message: str
    ) -> NotificationResponse:
        """
        Helper method to create a weather alert notification
        
        Args:
            user_id: ID of the user to notify (as string)
            alert_message: Weather alert message
            
        Returns:
            NotificationResponse: Created notification data
            
        Usage in WeatherService or other services:
            notification_service = NotificationService(self.db)
            await notification_service.create_weather_alert_notification(
                user_id=user_id,
                alert_message="Heavy rain expected in your area. Consider protective measures."
            )
        """
        notification_data = NotificationCreate(
            user_id=ObjectId(user_id),
            message=alert_message,
            type=NotificationType.WEATHER_ALERT
        )
        
        return await self.create_notification(notification_data)
    
    async def create_daily_weather_notification(
        self,
        user_id: str,
        farm_name: str,
        weather_summary: str
    ) -> NotificationResponse:
        """
        Helper method to create a daily weather forecast notification.
        
        Args:
            user_id: ID of the user to notify (as string)
            farm_name: Name of the farm for context
            weather_summary: A summary of the weather forecast
            
        Returns:
            NotificationResponse: Created notification data
        """
        message = f"Thời tiết hôm nay cho trang trại {farm_name}: {weather_summary}"
        notification_data = NotificationCreate(
            user_id=ObjectId(user_id),
            message=message,
            type=NotificationType.DAILY_WEATHER_FORECAST
        )
        return await self.create_notification(notification_data)
    
    async def get_user_notifications(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[NotificationResponse]:
        """
        Get notifications for a user with pagination, sorted by timestamp (newest first)
        
        Args:
            user_id: ID of the user (as string)
            skip: Number of notifications to skip (for pagination)
            limit: Maximum number of notifications to return (default: 20, max: 100)
            
        Returns:
            List[NotificationResponse]: List of user's notifications
        """
        # Ensure limit doesn't exceed maximum
        limit = min(limit, 100)
        
        cursor = self.collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).skip(skip).limit(limit)
        notifications = await cursor.to_list(length=limit)
        
        return [self._notification_to_response(notification) for notification in notifications]
    
    async def get_user_notifications_count(self, user_id: str) -> int:
        """
        Get total count of notifications for a user
        
        Args:
            user_id: ID of the user (as string)
            
        Returns:
            int: Total number of notifications
        """
        return await self.collection.count_documents({"user_id": ObjectId(user_id)})
    
    async def get_unread_notifications_count(self, user_id: str) -> int:
        """
        Get count of unread notifications for a user
        
        Args:
            user_id: ID of the user (as string)
            
        Returns:
            int: Number of unread notifications
        """
        return await self.collection.count_documents({
            "user_id": ObjectId(user_id),
            "read_status": False
        })
    
    async def mark_as_read(self, notification_id: str) -> NotificationResponse:
        """
        Mark a notification as read by updating read_status to True
        
        Args:
            notification_id: ID of the notification
            
        Returns:
            NotificationResponse: Updated notification data
            
        Raises:
            HTTPException: If notification not found
        """
        if not ObjectId.is_valid(notification_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        result = await self.collection.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read_status": True}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        # Retrieve and return updated notification
        updated_notification = await self.collection.find_one({"_id": ObjectId(notification_id)})
        return self._notification_to_response(updated_notification)
    
    def _notification_to_response(self, notification: dict) -> NotificationResponse:
        """
        Convert MongoDB notification document to NotificationResponse
        
        Args:
            notification: Notification document from MongoDB
            
        Returns:
            NotificationResponse: Formatted notification response
        """
        return NotificationResponse(
            id=str(notification["_id"]),
            user_id=str(notification["user_id"]),
            message=notification["message"],
            type=NotificationType(notification["type"]),
            read_status=notification["read_status"],
            created_at=notification["created_at"]
        )
