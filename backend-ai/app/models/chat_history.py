from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId

from app.models.base import PyObjectId


class ChatMessage(BaseModel):
    """Single chat message in conversation"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatHistoryInDB(BaseModel):
    """Chat history stored in MongoDB for each user"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId = Field(..., description="User ID (foreign key)")
    messages: List[ChatMessage] = Field(default=[], description="List of chat messages")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ChatHistoryResponse(BaseModel):
    """Response containing user's chat history"""
    user_id: str = Field(..., description="User ID")
    messages: List[ChatMessage] = Field(..., description="Chat message history")
    total_messages: int = Field(..., description="Total number of messages")
    last_updated: datetime = Field(..., description="Last update timestamp")
