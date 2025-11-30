from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any
from math import ceil

from app.models.notification import NotificationResponse, PaginatedNotificationResponse
from app.models.user import UserInDB
from app.models.api_response import APIResponse, success_response, error_response
from app.services.notification_service import NotificationService
from app.core.dependencies import get_current_user
from app.core.database import get_database


router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def get_notification_service() -> NotificationService:
    """Dependency to get NotificationService instance"""
    return NotificationService(get_database())


@router.get(
    "",
    response_model=APIResponse[PaginatedNotificationResponse]
)
async def get_notifications(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of notifications per page (max 100)"),
    current_user: UserInDB = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service)
) -> Dict[str, Any]:
    """
    Get notifications for the authenticated user with pagination, sorted by timestamp (newest first).
    
    - **page**: Page number (starts from 1)
    - **page_size**: Number of notifications per page (default: 20, max: 100)
    
    Returns paginated notifications with total count and unread count.
    """
    # Calculate skip value for pagination
    skip = (page - 1) * page_size
    
    # Get notifications, total count, and unread count
    notifications = await notification_service.get_user_notifications(
        str(current_user.id), 
        skip=skip, 
        limit=page_size
    )
    total = await notification_service.get_user_notifications_count(str(current_user.id))
    unread_count = await notification_service.get_unread_notifications_count(str(current_user.id))
    
    # Calculate total pages
    total_pages = ceil(total / page_size) if total > 0 else 1
    
    paginated_response = PaginatedNotificationResponse(
        notifications=[notification.model_dump() for notification in notifications],
        total=total,
        unread_count=unread_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
    
    return success_response(
        data=paginated_response.model_dump(),
        message=f"Retrieved {len(notifications)} notification(s) (page {page}/{total_pages})"
    )


@router.put(
    "/{notification_id}/read",
    response_model=APIResponse[NotificationResponse]
)
async def mark_notification_as_read(
    notification_id: str,
    current_user: UserInDB = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service)
) -> Dict[str, Any]:
    """
    Mark a notification as read (authenticated).
    
    - **notification_id**: ID of the notification to mark as read
    """
    try:
        notification = await notification_service.mark_as_read(notification_id)
        
        # Verify the notification belongs to the current user
        if notification.user_id != str(current_user.id):
            return error_response(
                message="You do not have permission to access this notification",
                code="FORBIDDEN"
            )
        
        return success_response(
            data=notification.model_dump(),
            message="Notification marked as read"
        )
    except HTTPException as e:
        return error_response(
            message=e.detail,
            code="NOTIFICATION_NOT_FOUND"
        )
