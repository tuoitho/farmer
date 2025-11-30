from fastapi import APIRouter, status, Depends, Header
from typing import Dict, Any, Optional

from app.models.user import (
    UserRegistration,
    LoginCredentials,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    UserProfileUpdate,
    ChangePasswordRequest
)
from app.models.api_response import APIResponse, success_response, error_response
from app.services.auth_service import AuthService


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# Dependency to get current user from token
async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise ValueError("Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService()
    user = await auth_service.verify_access_token(token)
    
    if user is None:
        raise ValueError("Invalid or expired token")
    
    return str(user.id)


@router.post("/register", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegistration) -> Dict[str, Any]:
    """
    Register a new user.
    
    - **full_name**: User's full name
    - **phone**: Phone number (10-15 digits)
    - **password**: Password (minimum 8 characters)
    - **confirm_password**: Password confirmation
    - **province**: User's province/city
    """
    auth_service = AuthService()
    
    try:
        user = await auth_service.register_user(user_data)
        return success_response(
            data=user.model_dump(),
            message="User registered successfully"
        )
    except ValueError as e:
        error_msg = str(e)
        if "already registered" in error_msg:
            return error_response(
                message=error_msg,
                code="PHONE_ALREADY_EXISTS"
            )
        elif "Passwords do not match" in error_msg:
            return error_response(
                message=error_msg,
                code="PASSWORD_MISMATCH"
            )
        return error_response(
            message=error_msg,
            code="REGISTRATION_FAILED"
        )


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(credentials: LoginCredentials) -> Dict[str, Any]:
    """
    Login with phone and password.
    
    Returns both access token (15 minutes) and refresh token (7 days).
    
    - **phone**: User's phone number
    - **password**: User's password
    """
    auth_service = AuthService()
    
    try:
        tokens = await auth_service.login_user(credentials)
        return success_response(
            data=tokens.model_dump(),
            message="Login successful"
        )
    except ValueError as e:
        return error_response(
            message="Invalid phone number or password",
            code="INVALID_CREDENTIALS"
        )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_token(request: RefreshTokenRequest) -> Dict[str, Any]:
    """
    Get a new access token using refresh token.
    
    - **refresh_token**: Valid refresh token
    """
    auth_service = AuthService()
    
    try:
        tokens = await auth_service.refresh_access_token(request.refresh_token)
        return success_response(
            data=tokens.model_dump(),
            message="Token refreshed successfully"
        )
    except ValueError as e:
        return error_response(
            message="Invalid or expired refresh token",
            code="INVALID_REFRESH_TOKEN"
        )


@router.post("/logout", response_model=APIResponse[None])
async def logout(request: RefreshTokenRequest) -> Dict[str, Any]:
    """
    Logout by revoking the refresh token.
    
    - **refresh_token**: Refresh token to revoke
    """
    auth_service = AuthService()
    
    revoked = await auth_service.revoke_refresh_token(request.refresh_token)
    
    if not revoked:
        return error_response(
            message="Invalid refresh token",
            code="INVALID_REFRESH_TOKEN"
        )
    
    return success_response(
        message="Logout successful"
    )


@router.get("/profile", response_model=APIResponse[UserResponse])
async def get_profile(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get current user profile.
    
    Requires authentication via Bearer token.
    """
    auth_service = AuthService()
    
    try:
        user = await auth_service.get_user_profile(user_id)
        return success_response(
            data=user.model_dump(),
            message="Profile retrieved successfully"
        )
    except ValueError as e:
        return error_response(
            message=str(e),
            code="USER_NOT_FOUND"
        )


@router.put("/profile", response_model=APIResponse[UserResponse])
async def update_profile(
    profile_data: UserProfileUpdate,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update current user profile.
    
    Requires authentication via Bearer token.
    
    - **full_name**: New full name (optional)
    - **province**: New province (optional)
    """
    auth_service = AuthService()
    
    try:
        updated_user = await auth_service.update_user_profile(user_id, profile_data)
        return success_response(
            data=updated_user.model_dump(),
            message="Profile updated successfully"
        )
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            return error_response(
                message=error_msg,
                code="USER_NOT_FOUND"
            )
        elif "No fields to update" in error_msg:
            return error_response(
                message=error_msg,
                code="NO_FIELDS_TO_UPDATE"
            )
        return error_response(
            message=error_msg,
            code="UPDATE_FAILED"
        )


@router.put("/change-password", response_model=APIResponse[None])
async def change_password(
    password_data: ChangePasswordRequest,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Change user password.
    
    Requires authentication via Bearer token.
    
    - **current_password**: Current password
    - **new_password**: New password (8-72 characters, must contain letter and number)
    - **confirm_new_password**: Confirm new password
    """
    auth_service = AuthService()
    
    try:
        await auth_service.change_password(user_id, password_data)
        return success_response(
            message="Password changed successfully"
        )
    except ValueError as e:
        error_msg = str(e)
        if "incorrect" in error_msg.lower():
            return error_response(
                message=error_msg,
                code="INCORRECT_PASSWORD"
            )
        elif "must be different" in error_msg.lower():
            return error_response(
                message=error_msg,
                code="SAME_PASSWORD"
            )
        elif "not found" in error_msg.lower():
            return error_response(
                message=error_msg,
                code="USER_NOT_FOUND"
            )
        return error_response(
            message=error_msg,
            code="PASSWORD_CHANGE_FAILED"
        )
