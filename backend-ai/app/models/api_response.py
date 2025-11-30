from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel, Field


T = TypeVar('T')


class FieldError(BaseModel):
    """Individual field error model"""
    field: str = Field(..., description="Field name")
    message: str = Field(..., description="Error message for this field")


class ErrorDetail(BaseModel):
    """Error detail model"""
    code: str = Field(..., description="Error code")
    message: str = Field(..., description="General error message")
    errors: Optional[List[FieldError]] = Field(None, description="List of field-specific errors")


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    data: Optional[T] = Field(None, description="Response data")
    error: Optional[ErrorDetail] = Field(None, description="Error details if failed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Operation completed successfully",
                "data": {},
                "error": None
            }
        }


def success_response(data: Any = None, message: str = "Success") -> dict:
    """Helper function to create success response"""
    return {
        "success": True,
        "message": message,
        "data": data,
        "error": None
    }


def error_response(
    message: str,
    code: str = "ERROR",
    errors: Optional[List[dict]] = None
) -> dict:
    """Helper function to create error response
    
    Args:
        message: General error message
        code: Error code
        errors: List of field errors in format [{"field": "field_name", "message": "error message"}]
    """
    return {
        "success": False,
        "message": message,
        "data": None,
        "error": {
            "code": code,
            "message": message,
            "errors": errors
        }
    }
