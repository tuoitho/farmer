from datetime import datetime, timedelta
from typing import Optional
import hashlib
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId

from app.core.config import settings
from app.core.database import get_database
from app.models.user import UserInDB, UserRegistration, LoginCredentials, TokenResponse, UserResponse, UserProfileUpdate, ChangePasswordRequest
from app.models.refresh_token import RefreshTokenInDB


# Password hashing context - using argon2 (no 72-byte limit like bcrypt)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class AuthService:
    """Authentication service handling user registration, login, and token management"""
    
    def __init__(self):
        self.db = get_database()
    
    # Password hashing functions
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using argon2 (no length limitation)"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    # Token generation functions
    @staticmethod
    def create_access_token(user_id: str) -> str:
        """Generate JWT access token with 15 minutes expiration"""
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "type": "access"
        }
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token_jwt(user_id: str) -> str:
        """Generate JWT refresh token with 7 days expiration"""
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "type": "refresh"
        }
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def hash_token(token: str) -> str:
        """Hash a token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    async def verify_access_token(self, token: str) -> Optional[UserInDB]:
        """Verify access token and return user"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if user_id is None or token_type != "access":
                return None
            
            # Get user from database
            user_doc = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if user_doc is None:
                return None
            
            return UserInDB(**user_doc)
        
        except JWTError:
            return None
    
    async def create_refresh_token(self, user_id: str) -> str:
        """Create and store a refresh token (JWT) in database"""
        refresh_token = self.create_refresh_token_jwt(user_id)
        token_hash = self.hash_token(refresh_token)
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        refresh_token_doc = RefreshTokenInDB(
            user_id=ObjectId(user_id),
            token_hash=token_hash,
            expires_at=expires_at,
            created_at=datetime.utcnow()
        )
        
        await self.db.refresh_tokens.insert_one(refresh_token_doc.model_dump(by_alias=True, exclude={"id"}))
        
        return refresh_token
    
    async def verify_refresh_token(self, token: str) -> Optional[UserInDB]:
        """Verify refresh token (JWT) and return user"""
        try:
            # First verify JWT signature and expiration
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if user_id is None or token_type != "refresh":
                return None
            
            # Then check if token exists in database (not revoked)
            token_hash = self.hash_token(token)
            refresh_token_doc = await self.db.refresh_tokens.find_one({
                "token_hash": token_hash,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            
            if refresh_token_doc is None:
                return None
            
            # Get user from database
            user_doc = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if user_doc is None:
                return None
            
            return UserInDB(**user_doc)
        
        except JWTError:
            return None
    
    async def revoke_refresh_token(self, token: str) -> bool:
        """Revoke a refresh token"""
        token_hash = self.hash_token(token)
        
        result = await self.db.refresh_tokens.delete_one({"token_hash": token_hash})
        return result.deleted_count > 0
    
    async def register_user(self, user_data: UserRegistration) -> UserResponse:
        """Register a new user"""
        # Password match validation is already done in the model validator
        
        # Check if phone already exists
        existing_user = await self.db.users.find_one({"phone": user_data.phone})
        if existing_user:
            raise ValueError("Phone number already registered")
        
        # Hash password
        password_hash = self.hash_password(user_data.password)
        
        # Create user document
        user_doc = UserInDB(
            full_name=user_data.full_name,
            phone=user_data.phone,
            password_hash=password_hash,
            province=user_data.province,
            created_at=datetime.utcnow()
        )
        
        # Insert into database
        result = await self.db.users.insert_one(user_doc.model_dump(by_alias=True, exclude={"id"}))
        user_id = str(result.inserted_id)
        
        # Return user response
        return UserResponse(
            id=user_id,
            full_name=user_data.full_name,
            phone=user_data.phone,
            province=user_data.province,
            created_at=user_doc.created_at
        )
    
    async def login_user(self, credentials: LoginCredentials) -> TokenResponse:
        """Authenticate user and return tokens"""
        # Find user by phone
        user_doc = await self.db.users.find_one({"phone": credentials.phone})
        if user_doc is None:
            raise ValueError("Invalid credentials")
        
        user = UserInDB(**user_doc)
        
        # Verify password
        if not self.verify_password(credentials.password, user.password_hash):
            raise ValueError("Invalid credentials")
        
        user_id = str(user.id)
        
        # Generate tokens
        access_token = self.create_access_token(user_id)
        refresh_token = await self.create_refresh_token(user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Generate new access token using refresh token"""
        # Verify refresh token
        user = await self.verify_refresh_token(refresh_token)
        if user is None:
            raise ValueError("Invalid or expired refresh token")
        
        user_id = str(user.id)
        
        # Generate new access token
        access_token = self.create_access_token(user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,  # Return same refresh token
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def get_user_profile(self, user_id: str) -> UserResponse:
        """Get user profile by ID"""
        user_doc = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if user_doc is None:
            raise ValueError("User not found")
        
        user = UserInDB(**user_doc)
        return UserResponse(
            id=str(user.id),
            full_name=user.full_name,
            phone=user.phone,
            province=user.province,
            created_at=user.created_at
        )
    
    async def update_user_profile(self, user_id: str, profile_data: UserProfileUpdate) -> UserResponse:
        """Update user profile"""
        # Check if user exists
        user_doc = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if user_doc is None:
            raise ValueError("User not found")
        
        # Build update data (only include fields that are provided)
        update_data = {}
        if profile_data.full_name is not None:
            update_data["full_name"] = profile_data.full_name
        if profile_data.province is not None:
            update_data["province"] = profile_data.province
        
        # If no fields to update, return current profile
        if not update_data:
            raise ValueError("No fields to update")
        
        # Update user in database
        await self.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user_doc = await self.db.users.find_one({"_id": ObjectId(user_id)})
        updated_user = UserInDB(**updated_user_doc)
        
        return UserResponse(
            id=str(updated_user.id),
            full_name=updated_user.full_name,
            phone=updated_user.phone,
            province=updated_user.province,
            created_at=updated_user.created_at
        )
    
    async def change_password(self, user_id: str, password_data: ChangePasswordRequest) -> bool:
        """Change user password"""
        # Get user
        user_doc = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if user_doc is None:
            raise ValueError("User not found")
        
        user = UserInDB(**user_doc)
        
        # Verify current password
        if not self.verify_password(password_data.current_password, user.password_hash):
            raise ValueError("Current password is incorrect")
        
        # Check if new password is same as current
        if self.verify_password(password_data.new_password, user.password_hash):
            raise ValueError("New password must be different from current password")
        
        # Hash new password
        new_password_hash = self.hash_password(password_data.new_password)
        
        # Update password in database
        await self.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password_hash": new_password_hash}}
        )
        
        return True
