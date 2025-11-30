from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class DiseaseDetectionRequest(BaseModel):
    """Request model for disease detection from image"""
    # Image will be uploaded as multipart/form-data, not in JSON body
    pass


class DiseasePrediction(BaseModel):
    """Single disease prediction with confidence"""
    disease: str = Field(..., description="Disease name")
    confidence: float = Field(..., description="Confidence score (0-1)", ge=0, le=1)


class DiseaseDetectionResult(BaseModel):
    """Result from disease detection model"""
    disease_name: str = Field(..., description="Primary detected disease")
    confidence: float = Field(..., description="Confidence score (0-1)", ge=0, le=1)
    top_predictions: List[DiseasePrediction] = Field(
        default=[],
        description="Top 3 disease predictions"
    )


class AIAdviceResponse(BaseModel):
    """Response from Clova Studio with disease advice"""
    disease_name: str = Field(..., description="Detected disease name")
    confidence: float = Field(..., description="Detection confidence")
    advice: str = Field(..., description="AI-generated advice about the disease")
    detected_at: datetime = Field(default_factory=datetime.utcnow)


class DiseaseAnalysisResponse(BaseModel):
    """Complete response for disease detection and analysis"""
    detection: DiseaseDetectionResult = Field(..., description="Disease detection results")
    ai_advice: Optional[str] = Field(None, description="AI advice from Clova Studio")
    success: bool = Field(..., description="Whether the analysis was successful")
    error: Optional[str] = Field(None, description="Error message if failed")


class ChatMessageRequest(BaseModel):
    """Chat message model for API requests"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(
        ..., 
        description="Message content",
        max_length=5000  # Limit message length to prevent DoS
    )


class ChatRequest(BaseModel):
    """Request for general chat with AI"""
    message: str = Field(
        ..., 
        description="User's message", 
        min_length=1,
        max_length=5000  # Limit to 5000 characters to prevent DoS and high API costs
    )
    conversation_history: Optional[List[ChatMessageRequest]] = Field(
        default=None,
        description="Previous conversation history",
        max_length=50  # Limit to 50 messages to prevent token overflow
    )


class ChatResponse(BaseModel):
    """Response from AI chat"""
    message: str = Field(..., description="AI response message")
    success: bool = Field(..., description="Whether the request was successful")
    error: Optional[str] = Field(None, description="Error message if failed")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    # Optional fields for image-based chat
    has_image_analysis: bool = Field(default=False, description="Whether this response includes image analysis")
    disease_detection: Optional[DiseaseDetectionResult] = Field(None, description="Disease detection results if image was provided")


class ImageUploadResponse(BaseModel):
    """Response after uploading image for disease detection"""
    image_processed: bool = Field(..., description="Whether image was processed")
    file_size: int = Field(..., description="Size of uploaded file in bytes")
    message: str = Field(..., description="Status message")


class ChatWithImageRequest(BaseModel):
    """Request for chat with optional image attachment"""
    message: str = Field(
        ...,
        description="User's message or question about the image",
        min_length=1,
        max_length=5000
    )
    # Image will be uploaded as multipart/form-data, not in JSON body
