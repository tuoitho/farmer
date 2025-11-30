from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId
from enum import Enum

from app.models.base import PyObjectId


class CropStatus(str, Enum):
    """Enum for crop status values"""
    PREPARING = "preparing"
    PLANTED = "planted"
    GROWING = "growing"
    FLOWERING = "flowering"
    HARVESTED = "harvested"
    FALLOW = "fallow"


class GeoJSONPoint(BaseModel):
    """GeoJSON Point structure"""
    type: Literal["Point"] = "Point"
    coordinates: List[float] = Field(..., min_length=2, max_length=2)
    
    @field_validator('coordinates')
    @classmethod
    def validate_coordinates(cls, v):
        """Validate longitude and latitude ranges"""
        if not (-180 <= v[0] <= 180):
            raise ValueError('Longitude must be between -180 and 180')
        if not (-90 <= v[1] <= 90):
            raise ValueError('Latitude must be between -90 and 90')
        return v


class FarmStatusHistoryItem(BaseModel):
    """Model for farm status history item"""
    status: CropStatus
    date: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FarmInDB(BaseModel):
    """Farm model stored in MongoDB"""
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: PyObjectId
    name: str
    location: GeoJSONPoint
    crop_type: Optional[str] = None
    variety: Optional[str] = None  # Giống cây (e.g., OM 18, IR64)
    area: Optional[float] = None
    crop_status: CropStatus = CropStatus.PREPARING
    status_history: List[FarmStatusHistoryItem] = []
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    image: Optional[str] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }


class FarmCreate(BaseModel):
    """Schema for creating a new farm"""
    name: str = Field(..., min_length=1, max_length=200)
    location: GeoJSONPoint
    crop_type: Optional[str] = Field(None, max_length=100)
    variety: Optional[str] = Field(None, max_length=100, description="Crop variety (e.g., OM 18, IR64)")
    area: Optional[float] = Field(None, ge=0, description="Area in square meters")
    crop_status: CropStatus = CropStatus.PREPARING
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    image: Optional[str] = None
    
    @field_validator('expected_harvest_date')
    @classmethod
    def validate_harvest_date(cls, v, info):
        """Ensure expected harvest date is after planting date"""
        if v and info.data.get('planting_date') and v < info.data['planting_date']:
            raise ValueError('Expected harvest date must be after planting date')
        return v


class FarmUpdate(BaseModel):
    """Schema for updating farm information"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    crop_type: Optional[str] = Field(None, max_length=100)
    variety: Optional[str] = Field(None, max_length=100)
    area: Optional[float] = Field(None, ge=0)
    crop_status: Optional[CropStatus] = None
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    image: Optional[str] = None
    
    @field_validator('expected_harvest_date')
    @classmethod
    def validate_harvest_date(cls, v, info):
        """Ensure expected harvest date is after planting date"""
        if v and info.data.get('planting_date') and v < info.data['planting_date']:
            raise ValueError('Expected harvest date must be after planting date')
        return v


class FarmResponse(BaseModel):
    """Schema for farm response"""
    id: str
    user_id: str
    name: str
    location: GeoJSONPoint
    crop_type: Optional[str] = None
    variety: Optional[str] = None
    area: Optional[float] = None
    crop_status: CropStatus
    status_history: List[FarmStatusHistoryItem] = []
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    image: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FarmFilters(BaseModel):
    """Schema for filtering farms"""
    crop_status: Optional[CropStatus] = None
    search: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
