from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.models.api_response import error_response


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors - returns all field errors"""
    validation_errors = exc.errors()
    
    if not validation_errors:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response(
                message="Validation error",
                code="VALIDATION_ERROR"
            )
        )
    
    # Process all validation errors
    field_errors = []
    
    for error in validation_errors:
        # Get field name
        loc = error.get("loc", [])
        # Remove 'body' from field path if present
        field_parts = [str(l) for l in loc if l != "body"]
        field = ".".join(field_parts) if field_parts else "unknown"
        
        # Get error message
        error_type = error.get("type", "")
        msg = error.get("msg", "Validation error")
        
        # Customize message based on error type
        if error_type == "string_too_short":
            ctx = error.get("ctx", {})
            min_length = ctx.get("min_length", "")
            message = f"Must be at least {min_length} characters"
        elif error_type == "string_too_long":
            ctx = error.get("ctx", {})
            max_length = ctx.get("max_length", "")
            message = f"Must not exceed {max_length} characters"
        elif error_type == "missing":
            message = "This field is required"
        elif error_type == "value_error":
            # This is our custom validation error
            message = msg.replace("Value error, ", "")
        elif error_type == "string_pattern_mismatch":
            message = "Invalid format"
        else:
            message = msg
        
        field_errors.append({
            "field": field,
            "message": message
        })
    
    # Create general message
    if len(field_errors) == 1:
        general_message = f"Validation error: {field_errors[0]['message']}"
    else:
        general_message = f"Validation failed for {len(field_errors)} field(s)"
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response(
            message=general_message,
            code="VALIDATION_ERROR",
            errors=field_errors
        )
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response(
            message="Internal server error",
            code="INTERNAL_ERROR"
        )
    )
