from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from bson import ObjectId
import re
import uuid

from app.models.base import PyObjectId


class UserInDB(BaseModel):
    """User model for MongoDB storage"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    full_name: str
    phone: str
    password_hash: str
    province: str
    clova_request_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()).replace("-", ""),
        description="Unique request ID for Clova Studio API per user"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserRegistration(BaseModel):
    """User registration request schema"""
    full_name: str = Field(
        ..., 
        min_length=2, 
        max_length=100,
        description="Full name (2-100 characters)"
    )
    phone: str = Field(
        ..., 
        description="Phone number (10-15 digits, optional + prefix)"
    )
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=72,
        description="Password (8-72 characters)"
    )
    confirm_password: str = Field(
        ..., 
        min_length=8, 
        max_length=72,
        description="Confirm password (8-72 characters)"
    )
    province: str = Field(
        ..., 
        min_length=2, 
        max_length=100,
        description="Province/City name"
    )
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        """Validate full name"""
        v = v.strip()
        if not v:
            raise ValueError('Full name cannot be empty or whitespace only')
        if len(v) < 2:
            raise ValueError('Full name must be at least 2 characters')
        # Allow letters (including Vietnamese), numbers, and spaces
        if not re.match(r'^[a-zA-ZÀ-ỹ0-9\s]+$', v):
            raise ValueError('Full name can only contain letters, numbers and spaces')
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate phone number"""
        v = v.strip()
        # Remove spaces and dashes
        phone_clean = re.sub(r'[\s\-]', '', v)
        
        # Check if it matches Vietnamese phone format
        # Vietnamese phone: 10 digits starting with 0, or with +84
        if not re.match(r'^(\+84|0)[0-9]{9,10}$', phone_clean):
            raise ValueError('Invalid phone number format. Use Vietnamese format: 0xxxxxxxxx or +84xxxxxxxxx')
        
        return phone_clean
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(v) > 72:
            raise ValueError('Password cannot be longer than 72 characters')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @field_validator('province')
    @classmethod
    def validate_province(cls, v: str) -> str:
        """Validate province name"""
        v = v.strip()
        if not v:
            raise ValueError('Province cannot be empty or whitespace only')
        if len(v) < 2:
            raise ValueError('Province name must be at least 2 characters')
        return v
    
    @model_validator(mode='after')
    def validate_passwords_match(self):
        """Validate that password and confirm_password match"""
        if self.password != self.confirm_password:
            raise ValueError('Passwords do not match')
        return self


class LoginCredentials(BaseModel):
    """Login request schema"""
    phone: str = Field(
        ..., 
        description="Phone number"
    )
    password: str = Field(
        ..., 
        min_length=1,
        description="Password"
    )
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate phone number"""
        v = v.strip()
        if not v:
            raise ValueError('Phone number is required')
        # Remove spaces and dashes
        phone_clean = re.sub(r'[\s\-]', '', v)
        return phone_clean
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password is not empty"""
        if not v or not v.strip():
            raise ValueError('Password is required')
        return v


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    full_name: str
    phone: str
    province: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str = Field(
        ...,
        min_length=1,
        description="Refresh token"
    )
    
    @field_validator('refresh_token')
    @classmethod
    def validate_refresh_token(cls, v: str) -> str:
        """Validate refresh token is not empty"""
        v = v.strip()
        if not v:
            raise ValueError('Refresh token is required')
        if len(v) < 10:
            raise ValueError('Invalid refresh token format')
        return v


class UserProfileUpdate(BaseModel):
    """User profile update request schema"""
    full_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="Full name (2-100 characters)"
    )
    province: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="Province/City name"
    )
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate full name"""
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError('Full name cannot be empty or whitespace only')
        if len(v) < 2:
            raise ValueError('Full name must be at least 2 characters')
        # Allow letters (including Vietnamese), numbers, and spaces
        if not re.match(r'^[a-zA-ZÀ-ỹ0-9\s]+$', v):
            raise ValueError('Full name can only contain letters, numbers and spaces')
        return v
    
    @field_validator('province')
    @classmethod
    def validate_province(cls, v: Optional[str]) -> Optional[str]:
        """Validate province name"""
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError('Province cannot be empty or whitespace only')
        if len(v) < 2:
            raise ValueError('Province name must be at least 2 characters')
        return v


class ChangePasswordRequest(BaseModel):
    """Change password request schema"""
    current_password: str = Field(
        ...,
        min_length=1,
        description="Current password"
    )
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="New password (8-72 characters)"
    )
    confirm_new_password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="Confirm new password"
    )
    
    @field_validator('current_password')
    @classmethod
    def validate_current_password(cls, v: str) -> str:
        """Validate current password is not empty"""
        if not v or not v.strip():
            raise ValueError('Current password is required')
        return v
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate new password strength"""
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters')
        if len(v) > 72:
            raise ValueError('New password cannot be longer than 72 characters')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('New password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('New password must contain at least one number')
        return v
    
    @model_validator(mode='after')
    def validate_passwords_match(self):
        """Validate that new password and confirm match"""
        if self.new_password != self.confirm_new_password:
            raise ValueError('New passwords do not match')
        return self
