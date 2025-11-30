# Input Validation Rules

Comprehensive validation rules for all API endpoints in **NÔNG DÂN AI**.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Farm Management](#farm-management)
- [Weather](#weather)
- [AI Features](#ai-features)
- [Notifications](#notifications)
- [Common Rules](#common-rules)

## Authentication

### POST /api/auth/register

#### Request Body

```python
{
    "email": str,        # Required
    "password": str,     # Required
    "name": str,         # Required
    "phone_number": str  # Optional
}
```

#### Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `email` | ✅ Yes | string | - Valid email format<br>- Max length: 255 chars<br>- Must be unique<br>- Case-insensitive |
| `password` | ✅ Yes | string | - Min length: 8 chars<br>- Max length: 128 chars<br>- Must contain: uppercase, lowercase, digit |
| `name` | ✅ Yes | string | - Min length: 2 chars<br>- Max length: 100 chars<br>- Unicode supported |
| `phone_number` | ❌ No | string | - Format: `+84xxxxxxxxx` or `0xxxxxxxxx`<br>- Length: 10-15 chars |

**Password Requirements**:
- ✅ At least 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one digit (0-9)
- ✅ Special characters allowed but not required
- ✅ Max 128 characters (Argon2 optimized)

**Email Format**:
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

**Error Responses**:
```json
// Invalid email
{
    "detail": "Invalid email format"
}

// Weak password
{
    "detail": "Password must be at least 8 characters and contain uppercase, lowercase, and digit"
}

// Email already exists
{
    "detail": "Email already registered"
}
```

### POST /api/auth/login

#### Request Body

```python
{
    "email": str,     # Required
    "password": str   # Required
}
```

#### Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `email` | ✅ Yes | string | - Valid email format |
| `password` | ✅ Yes | string | - Any length (verified against hash) |

**Error Responses**:
```json
// Invalid credentials
{
    "detail": "Invalid email or password"
}

// Account inactive
{
    "detail": "Account is inactive"
}
```

### POST /api/auth/refresh

#### Request Body

```python
{
    "refresh_token": str  # Required
}
```

#### Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `refresh_token` | ✅ Yes | string | - Valid JWT format<br>- Not expired<br>- Exists in database |

**Error Responses**:
```json
// Invalid token
{
    "detail": "Invalid refresh token"
}

// Expired token
{
    "detail": "Refresh token expired"
}

// Token not found
{
    "detail": "Refresh token not found"
}
```

## User Management

### GET /api/auth/me

**Authentication**: Required (Bearer token)

**No validation** (retrieves current user from JWT)

### PUT /api/auth/me

#### Request Body

```python
{
    "name": str,           # Optional
    "phone_number": str,   # Optional
    "current_password": str, # Required if changing password
    "new_password": str      # Optional
}
```

#### Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `name` | ❌ No | string | - Min length: 2 chars<br>- Max length: 100 chars |
| `phone_number` | ❌ No | string | - Format: `+84xxxxxxxxx` or `0xxxxxxxxx` |
| `current_password` | Conditional | string | - Required if `new_password` provided<br>- Must match current password |
| `new_password` | ❌ No | string | - Same rules as registration password<br>- Must be different from current |

**Error Responses**:
```json
// Current password incorrect
{
    "detail": "Current password is incorrect"
}

// New password same as current
{
    "detail": "New password must be different from current password"
}
```

## Farm Management

### GET /api/farms/

**Authentication**: Required

**Query Parameters**:

| Parameter | Required | Type | Rules |
|-----------|----------|------|-------|
| `skip` | ❌ No | integer | - Min: 0<br>- Default: 0 |
| `limit` | ❌ No | integer | - Min: 1<br>- Max: 100<br>- Default: 10 |

### POST /api/farms/

#### Request Body

```python
{
    "name": str,              # Required
    "location": {             # Required
        "type": "Point",      # Required
        "coordinates": [float, float]  # Required [longitude, latitude]
    },
    "area": float,            # Required
    "crop_type": str,         # Required
    "soil_type": str,         # Optional
    "irrigation_type": str    # Optional
}
```

#### Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `name` | ✅ Yes | string | - Min length: 3 chars<br>- Max length: 200 chars<br>- Unicode supported |
| `location.type` | ✅ Yes | string | - Must be exactly `"Point"` |
| `location.coordinates` | ✅ Yes | array | - Exactly 2 elements<br>- `[longitude, latitude]`<br>- Longitude: -180 to 180<br>- Latitude: -90 to 90 |
| `area` | ✅ Yes | float | - Min: 0.01 (100m²)<br>- Max: 1000000 (unlimited)<br>- Unit: hectares |
| `crop_type` | ✅ Yes | string | - Min length: 2 chars<br>- Max length: 100 chars |
| `soil_type` | ❌ No | string | - Max length: 100 chars |
| `irrigation_type` | ❌ No | string | - Max length: 100 chars |

**GeoJSON Point Format**:
```json
{
    "type": "Point",
    "coordinates": [105.8342, 21.0278]  // [longitude, latitude]
}
```

**Common Vietnam Coordinates**:
- Hanoi: `[105.8342, 21.0278]`
- Ho Chi Minh: `[106.6297, 10.8231]`
- Da Nang: `[108.2022, 16.0544]`

**Error Responses**:
```json
// Invalid coordinates
{
    "detail": "Invalid GeoJSON format"
}

// Out of range
{
    "detail": "Longitude must be between -180 and 180"
}
```

### GET /api/farms/{farm_id}

**Path Parameters**:

| Parameter | Required | Type | Rules |
|-----------|----------|------|-------|
| `farm_id` | ✅ Yes | string | - Valid MongoDB ObjectId (24 hex chars) |

**Error Responses**:
```json
// Invalid ID format
{
    "detail": "Invalid farm ID format"
}

// Not found
{
    "detail": "Farm not found"
}

// Unauthorized
{
    "detail": "Not authorized to access this farm"
}
```

### PUT /api/farms/{farm_id}

Same validation as POST, but all fields are optional (partial update).

### DELETE /api/farms/{farm_id}

Same path parameter validation as GET.

## Weather

### GET /api/weather/{farm_id}

**Path Parameters**:

| Parameter | Required | Type | Rules |
|-----------|----------|------|-------|
| `farm_id` | ✅ Yes | string | - Valid MongoDB ObjectId<br>- Farm must exist<br>- User must own farm |

**Query Parameters**:

| Parameter | Required | Type | Rules |
|-----------|----------|------|-------|
| `days` | ❌ No | integer | - Min: 1<br>- Max: 14<br>- Default: 7 |

**Error Responses**:
```json
// Weather API error
{
    "detail": "Failed to fetch weather data"
}

// Farm not found
{
    "detail": "Farm not found"
}
```

## AI Features

### POST /api/ai/detect-disease

**Authentication**: Required

**Content-Type**: `multipart/form-data`

#### Form Data

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `file` | ✅ Yes | file | - Image file (JPEG, PNG, WebP)<br>- Max size: 10MB<br>- Min dimensions: 150x150<br>- Recommended: 512x512+ |

**Allowed MIME Types**:
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

**Image Requirements**:
- Clear, well-lit plant leaf photo
- Single leaf or plant part
- No heavy filters or editing
- Minimal background noise

**Validation**:
```python
# File size check
if file.size > 10 * 1024 * 1024:  # 10MB
    raise HTTPException(400, "File size exceeds 10MB")

# MIME type check
allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
if file.content_type not in allowed:
    raise HTTPException(400, "Invalid file type")

# Image dimensions check
from PIL import Image
img = Image.open(file.file)
if img.width < 150 or img.height < 150:
    raise HTTPException(400, "Image too small (min 150x150)")
```

**Error Responses**:
```json
// File too large
{
    "detail": "File size exceeds 10MB limit"
}

// Invalid file type
{
    "detail": "Only JPEG, PNG, and WebP images are allowed"
}

// Image too small
{
    "detail": "Image dimensions must be at least 150x150 pixels"
}

// AI model error
{
    "detail": "Failed to process image"
}
```

### POST /api/ai/chat

**Authentication**: Required

**Content-Type**: `application/json`

#### Request Body

```python
{
    "message": str,           # Required
    "disease_name": str,      # Optional
    "conversation_history": [ # Optional
        {
            "role": str,      # "user" or "assistant"
            "content": str
        }
    ]
}
```

#### Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `message` | ✅ Yes | string | - Min length: 1 char<br>- Max length: 2000 chars<br>- Non-empty after trim |
| `disease_name` | ❌ No | string | - Max length: 200 chars |
| `conversation_history` | ❌ No | array | - Max items: 20<br>- Each item: `{role, content}` |
| `conversation_history[].role` | ✅ Yes | string | - Must be `"user"` or `"assistant"` |
| `conversation_history[].content` | ✅ Yes | string | - Max length: 2000 chars |

**Error Responses**:
```json
// Message too long
{
    "detail": "Message exceeds 2000 characters"
}

// Too many history items
{
    "detail": "Conversation history limited to 20 messages"
}

// Clova Studio API error
{
    "detail": "AI service temporarily unavailable"
}
```

### GET /api/ai/health

**No validation** (health check endpoint)

## Notifications

### GET /api/notifications/

**Authentication**: Required

**Query Parameters**:

| Parameter | Required | Type | Rules |
|-----------|----------|------|-------|
| `skip` | ❌ No | integer | - Min: 0<br>- Default: 0 |
| `limit` | ❌ No | integer | - Min: 1<br>- Max: 100<br>- Default: 20 |
| `is_read` | ❌ No | boolean | - `true`, `false` |

### PUT /api/notifications/{notification_id}/read

**Path Parameters**:

| Parameter | Required | Type | Rules |
|-----------|----------|------|-------|
| `notification_id` | ✅ Yes | string | - Valid MongoDB ObjectId |

### POST /api/notifications/test-weather

**Authentication**: Required

#### Request Body

```python
{
    "farm_id": str  # Required
}
```

#### Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `farm_id` | ✅ Yes | string | - Valid MongoDB ObjectId<br>- Farm must exist<br>- User must own farm |

## Common Rules

### MongoDB ObjectId Format

**Format**: 24-character hexadecimal string

**Regex**: `^[0-9a-fA-F]{24}$`

**Example**: `507f1f77bcf86cd799439011`

**Validation**:
```python
from bson import ObjectId

def is_valid_object_id(id: str) -> bool:
    try:
        ObjectId(id)
        return True
    except:
        return False
```

### Pagination

**Query Parameters**:
```python
skip: int = 0   # Offset (start from)
limit: int = 10 # Page size
```

**Rules**:
- `skip` >= 0
- `limit` >= 1
- `limit` <= 100 (max page size)

**Response**:
```json
{
    "total": 42,
    "items": [...],
    "skip": 0,
    "limit": 10
}
```

### Date/Time Format

**ISO 8601**: `YYYY-MM-DDTHH:MM:SS.mmmZ`

**Example**: `2024-01-15T14:30:00.000Z`

**Timezone**: Always UTC

### Common HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Validation error |
| `401` | Unauthorized | Missing/invalid auth token |
| `403` | Forbidden | No permission for resource |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Invalid data format |
| `500` | Internal Server Error | Server error |

### Error Response Format

**Standard Error**:
```json
{
    "detail": "Error message here"
}
```

**Validation Error**:
```json
{
    "detail": [
        {
            "loc": ["body", "email"],
            "msg": "Invalid email format",
            "type": "value_error"
        }
    ]
}
```

## Security Headers

### Required Headers

**Authentication**:
```
Authorization: Bearer <access_token>
```

**Content Type**:
```
Content-Type: application/json
```

**For file uploads**:
```
Content-Type: multipart/form-data
```

### CORS

**Allowed Origins**: Configured in `CORS_ORIGINS` env variable

**Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Allowed Headers**: `Authorization`, `Content-Type`

## Rate Limiting

**Not implemented yet** - Future consideration:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Validation Examples

### Python Client

```python
import requests
from typing import Optional

def register_user(email: str, password: str, name: str, phone: Optional[str] = None):
    # Client-side validation
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    if not any(c.isupper() for c in password):
        raise ValueError("Password must contain uppercase letter")
    
    if not any(c.islower() for c in password):
        raise ValueError("Password must contain lowercase letter")
    
    if not any(c.isdigit() for c in password):
        raise ValueError("Password must contain digit")
    
    # Make request
    response = requests.post(
        "http://localhost:8000/api/auth/register",
        json={
            "email": email,
            "password": password,
            "name": name,
            "phone_number": phone
        }
    )
    
    if response.status_code == 400:
        print(f"Validation error: {response.json()['detail']}")
    
    return response.json()
```

### TypeScript Client

```typescript
interface RegistrationData {
    email: string;
    password: string;
    name: string;
    phone_number?: string;
}

function validatePassword(password: string): string[] {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain lowercase letter");
    }
    
    if (!/\d/.test(password)) {
        errors.push("Password must contain digit");
    }
    
    return errors;
}

async function registerUser(data: RegistrationData) {
    // Client-side validation
    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length > 0) {
        throw new Error(passwordErrors.join(", "));
    }
    
    const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
    }
    
    return response.json();
}
```

### cURL Examples

```bash
# Valid registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "Nguyễn Văn A",
    "phone_number": "+84901234567"
  }'

# Upload image for disease detection
curl -X POST http://localhost:8000/api/ai/detect-disease \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/leaf.jpg"

# Create farm with location
curl -X POST http://localhost:8000/api/farms/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nông trại Hòa Bình",
    "location": {
      "type": "Point",
      "coordinates": [105.8342, 21.0278]
    },
    "area": 2.5,
    "crop_type": "Rice"
  }'
```

## Testing Validation

### Pytest Examples

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_weak_password():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "weak",
        "name": "Test User"
    })
    assert response.status_code == 400
    assert "at least 8 characters" in response.json()["detail"]

def test_register_invalid_email():
    response = client.post("/api/auth/register", json={
        "email": "not-an-email",
        "password": "SecurePass123",
        "name": "Test User"
    })
    assert response.status_code == 400
    assert "Invalid email" in response.json()["detail"]

def test_upload_oversized_image():
    # Create 11MB file
    large_file = b"x" * (11 * 1024 * 1024)
    response = client.post(
        "/api/ai/detect-disease",
        headers={"Authorization": "Bearer token"},
        files={"file": ("large.jpg", large_file, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "10MB" in response.json()["detail"]
```

## Additional Resources

- [Pydantic Validation](https://docs.pydantic.dev/latest/concepts/validators/)
- [FastAPI Request Validation](https://fastapi.tiangolo.com/tutorial/body/)
- [MongoDB ObjectId Spec](https://docs.mongodb.com/manual/reference/method/ObjectId/)
- [GeoJSON Format](https://geojson.org/)
- [ISO 8601 DateTime](https://en.wikipedia.org/wiki/ISO_8601)
