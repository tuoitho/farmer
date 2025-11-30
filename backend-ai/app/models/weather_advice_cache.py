from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.base import PyObjectId

class WeatherAdviceCacheInDB(BaseModel):
    """Model lưu trữ cache lời khuyên thời tiết"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    farm_id: PyObjectId = Field(..., description="ID của nông trại")
    date: str = Field(..., description="Ngày dự báo (YYYY-MM-DD)")
    advice: str = Field(..., description="Nội dung lời khuyên")
    location_name: str = Field(..., description="Tên địa điểm tại thời điểm cache")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
