# API Response Structure

## Overview

All API endpoints return responses in a standardized structure using the `APIResponse` wrapper to ensure consistency and ease of handling on the client side.

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "error": null
}
```

### Error Response (Single Error)

```json
{
  "success": false,
  "message": "Error message",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message",
    "errors": null
  }
}
```

### Error Response (Multiple Validation Errors)

```json
{
  "success": false,
  "message": "Validation failed for 3 field(s)",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for 3 field(s)",
    "errors": [
      {
        "field": "phone",
        "message": "Invalid phone number format"
      },
      {
        "field": "password",
        "message": "Must be at least 8 characters"
      },
      {
        "field": "full_name",
        "message": "This field is required"
      }
    ]
  }
}
```

## Fields Description

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates whether the request was successful |
| `message` | string | Human-readable message describing the result |
| `data` | object/null | Response data (null if error) |
| `error` | object/null | Error details (null if success) |
| `error.code` | string | Machine-readable error code |
| `error.message` | string | Detailed error message |
| `error.errors` | array/null | List of field-specific errors (for validation errors) |
| `error.errors[].field` | string | Field name causing the error |
| `error.errors[].message` | string | Error message for this specific field |

## Error Codes

### Authentication Errors (`/api/auth/*`)

| Code | HTTP Status | Description | Example Message |
|------|-------------|-------------|-----------------|
| `INVALID_CREDENTIALS` | 401 | Invalid phone or password | "Invalid phone number or password" |
| `PHONE_ALREADY_EXISTS` | 400 | Phone number already registered | "Phone number already registered" |
| `PASSWORD_MISMATCH` | 400 | Passwords don't match | "Passwords do not match" |
| `INVALID_REFRESH_TOKEN` | 401 | Invalid or expired refresh token | "Invalid or expired refresh token" |
| `REGISTRATION_FAILED` | 400 | User registration failed | Error details vary |

### Farm Management Errors (`/api/farms/*`)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `FARM_CREATION_FAILED` | 400 | Failed to create farm |
| `FARM_NOT_FOUND` | 404 | Farm not found |
| `FORBIDDEN` | 403 | No permission to access farm |
| `FARM_UPDATE_FAILED` | 400 | Failed to update farm |
| `STATUS_UPDATE_FAILED` | 400 | Failed to update crop status |
| `VALIDATION_ERROR` | 400 | Input validation failed |

### Weather Errors (`/api/weather/*`)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `FARM_NOT_FOUND` | 404 | Farm not found |
| `FORBIDDEN` | 403 | No permission to access farm |
| `WEATHER_API_ERROR` | 500 | Weather API request failed |
| `INVALID_LOCATION` | 400 | Invalid location data |

### AI Errors (`/api/ai/*`)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_TYPE` | 400 | File must be an image |
| `FILE_TOO_LARGE` | 400 | Image exceeds size limit (10MB) |
| `DETECTION_FAILED` | 500 | AI disease detection failed |
| `PROCESSING_ERROR` | 500 | Error processing request |
| `CHAT_FAILED` | 500 | AI chat request failed |
| `CHAT_ERROR` | 500 | Error in chat processing |

### Notification Errors (`/api/notifications/*`)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOTIFICATION_SEND_FAILED` | 500 | Failed to send notification |
| `WEBHOOK_ERROR` | 500 | n8n webhook request failed |

### Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request validation failed |

## Examples by Endpoint

### Authentication

#### Register Success
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "full_name": "Nguyen Van A",
    "phone": "0123456789",
    "province": "Hanoi",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

#### Login Success
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "access_token_expires_in": 900,
    "refresh_token_expires_in": 604800
  },
  "error": null
}
```

#### Registration Error (Validation)
```json
{
  "success": false,
  "message": "Validation failed for 2 field(s)",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for 2 field(s)",
    "errors": [
      {
        "field": "phone",
        "message": "Invalid phone number format. Use Vietnamese format: 0xxxxxxxxx or +84xxxxxxxxx"
      },
      {
        "field": "password",
        "message": "Password must contain at least one number"
      }
    ]
  }
}
```

### Farm Management

#### Create Farm Success
```json
{
  "success": true,
  "message": "Farm created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439011",
    "name": "My Rice Farm",
    "location": {
      "type": "Point",
      "coordinates": [105.8342, 21.0278]
    },
    "crop_type": "Rice",
    "crop_status": "preparing",
    "planting_date": null,
    "expected_harvest_date": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

#### Get Farms Success
```json
{
  "success": true,
  "message": "Retrieved 2 farm(s)",
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "My Rice Farm",
      "crop_type": "Rice",
      "crop_status": "growing",
      // ... other fields
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Corn Field",
      "crop_type": "Corn",
      "crop_status": "planted",
      // ... other fields
    }
  ],
  "error": null
}
```

### AI Disease Detection

#### Detect Disease Success
```json
{
  "success": true,
  "message": "Disease analysis completed successfully",
  "data": {
    "detection": {
      "disease_name": "Tomato - Early blight",
      "confidence": 0.96,
      "top_predictions": [
        {
          "disease": "Tomato - Early blight",
          "confidence": 0.96
        },
        {
          "disease": "Tomato - Late blight",
          "confidence": 0.03
        },
        {
          "disease": "Tomato - healthy",
          "confidence": 0.01
        }
      ]
    },
    "ai_advice": "Bệnh Early blight (Đốm lá sớm) là bệnh do nấm...",
    "success": true,
    "error": null
  },
  "error": null
}
```

#### Chat Success
```json
{
  "success": true,
  "message": "Chat response generated successfully",
  "data": {
    "message": "Để phòng tránh bệnh đốm lá trên cây cà chua...",
    "success": true,
    "error": null,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

#### Image Upload Error
```json
{
  "success": false,
  "message": "Image file too large. Maximum size is 10MB",
  "data": null,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Image file too large. Maximum size is 10MB",
    "errors": null
  }
}
```

### Weather

#### Get Weather Success
```json
{
  "success": true,
  "message": "Weather forecast retrieved successfully",
  "data": {
    "location": {
      "name": "Hanoi",
      "region": "Ha Noi",
      "country": "Vietnam",
      "lat": 21.03,
      "lon": 105.85
    },
    "current": {
      "temp_c": 28.0,
      "condition": {
        "text": "Partly cloudy"
      },
      "wind_kph": 15.0,
      "humidity": 70,
      "precip_mm": 0.0
    },
    "forecast": [
      // 7-day forecast array
    ]
  },
  "error": null
}
```

## HTTP Status Codes

| Status Code | Description | When Used |
|-------------|-------------|-----------|
| 200 | OK | Successful GET, PATCH, POST (when not creating) |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, business logic errors |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Request validation failed |
| 500 | Internal Server Error | Server-side errors |

## Client-Side Handling

### TypeScript/JavaScript Example

```typescript
interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code: string;
    message: string;
    errors: Array<{
      field: string;
      message: string;
    }> | null;
  } | null;
}

// Usage
async function registerUser(userData: UserRegistration) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  const result: APIResponse<UserResponse> = await response.json();
  
  if (result.success) {
    console.log('User registered:', result.data);
    return result.data;
  } else {
    // Handle errors
    if (result.error?.errors) {
      // Multiple validation errors
      result.error.errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    } else {
      // Single error
      console.error(result.error?.message);
    }
    throw new Error(result.message);
  }
}
```

### Python Example

```python
import requests
from typing import Optional, Dict, Any

class APIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def register_user(self, user_data: dict) -> Optional[dict]:
        response = requests.post(
            f"{self.base_url}/api/auth/register",
            json=user_data
        )
        
        result = response.json()
        
        if result['success']:
            print(f"User registered: {result['data']}")
            return result['data']
        else:
            # Handle errors
            error = result.get('error', {})
            if error.get('errors'):
                for err in error['errors']:
                    print(f"Error in {err['field']}: {err['message']}")
            else:
                print(f"Error: {error.get('message')}")
            return None
```

## Best Practices

1. **Always check `success` field** before accessing `data`
2. **Handle both single and multiple errors** (check if `error.errors` exists)
3. **Display `message` to users** - it's human-readable
4. **Use `error.code` for programmatic handling** - don't rely on message text
5. **Log full error object** for debugging
6. **Show field-specific errors** next to form inputs when available
7. **Handle network errors** separately from API errors
8. **Implement retry logic** for 5xx errors
9. **Cache successful responses** when appropriate
10. **Use proper HTTP status codes** in your error handling

## Versioning

Current API version: **v1**

Response structure is guaranteed to remain compatible within major version. Breaking changes will increment the major version number.
