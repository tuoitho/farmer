# Notification Integration Guide

Guide for integrating notifications into **NÔNG DÂN AI** services.

## Table of Contents

- [Overview](#overview)
- [NotificationService API](#notificationservice-api)
- [Integration Examples](#integration-examples)
- [n8n Webhook Setup](#n8n-webhook-setup)
- [Notification Types](#notification-types)
- [Best Practices](#best-practices)

## Overview

The notification system provides real-time alerts to users about important events:

- **Disease Detection**: When AI detects plant diseases
- **Weather Alerts**: Severe weather warnings
- **System Notifications**: General updates and reminders

**Architecture**:
```
[Service] → [NotificationService] → [MongoDB] → [User API]
                ↓
          [n8n Webhook] → [External Channels]
```

## NotificationService API

### Import

```python
from app.services.notification_service import NotificationService
from motor.motor_asyncio import AsyncIOMotorDatabase
```

### Initialize

```python
class YourService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.notification_service = NotificationService(db)
```

### Methods

#### `create_notification()`

Create generic notification.

```python
await notification_service.create_notification(
    user_id: str,              # Required: User ObjectId
    type: str,                 # Required: "disease", "weather", "system"
    title: str,                # Required: Notification title
    message: str,              # Required: Notification body
    metadata: dict = None      # Optional: Additional data
)
```

**Returns**: `Notification` model

#### `create_disease_notification()`

Create disease detection notification.

```python
await notification_service.create_disease_notification(
    user_id: str,              # Required: User ObjectId
    disease_name: str,         # Required: Detected disease name
    confidence: float = None,  # Optional: Detection confidence (0-1)
    farm_name: str = None      # Optional: Farm name
)
```

**Returns**: `Notification` model

**Example**:
```python
notification = await notification_service.create_disease_notification(
    user_id="507f1f77bcf86cd799439011",
    disease_name="Tomato Late Blight",
    confidence=0.95,
    farm_name="Nông trại Hòa Bình"
)
```

#### `create_weather_notification()`

Create weather alert notification.

```python
await notification_service.create_weather_notification(
    user_id: str,              # Required: User ObjectId
    weather_alert: str,        # Required: Alert message
    severity: str = "medium",  # Optional: "low", "medium", "high"
    farm_name: str = None      # Optional: Farm name
)
```

**Returns**: `Notification` model

**Example**:
```python
notification = await notification_service.create_weather_notification(
    user_id="507f1f77bcf86cd799439011",
    weather_alert="Heavy rainfall expected (50mm) in the next 6 hours",
    severity="high",
    farm_name="Nông trại Hòa Bình"
)
```

#### `get_user_notifications()`

Get user's notifications (paginated).

```python
notifications = await notification_service.get_user_notifications(
    user_id: str,              # Required: User ObjectId
    skip: int = 0,             # Optional: Offset
    limit: int = 20,           # Optional: Page size
    is_read: bool = None       # Optional: Filter by read status
)
```

**Returns**: `List[Notification]`

#### `mark_as_read()`

Mark notification as read.

```python
notification = await notification_service.mark_as_read(
    notification_id: str,      # Required: Notification ObjectId
    user_id: str               # Required: User ObjectId (for authorization)
)
```

**Returns**: `Notification` model or `None`

#### `trigger_weather_webhook()`

Send weather data to n8n webhook.

```python
await notification_service.trigger_weather_webhook(
    user_id: str,              # Required: User ObjectId
    farm_id: str,              # Required: Farm ObjectId
    weather_data: dict         # Required: Weather data from OpenWeatherMap
)
```

**Returns**: HTTP status code (int)

## Integration Examples

### 1. Disease Detection Integration

**In `app/services/disease_detection_service.py`**:

```python
from app.services.notification_service import NotificationService

class DiseaseDetectionService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.notification_service = NotificationService(db)
    
    async def detect_disease(self, user_id: str, image_file, farm_id: str = None):
        # Run ML prediction
        disease_name, confidence, top_predictions = await self._predict(image_file)
        
        # Get farm name if farm_id provided
        farm_name = None
        if farm_id:
            farm = await self.db.farms.find_one({"_id": ObjectId(farm_id)})
            farm_name = farm.get("name") if farm else None
        
        # Create notification
        await self.notification_service.create_disease_notification(
            user_id=user_id,
            disease_name=disease_name,
            confidence=confidence,
            farm_name=farm_name
        )
        
        return {
            "disease_name": disease_name,
            "confidence": confidence,
            "top_predictions": top_predictions
        }
```

### 2. Weather Alert Integration

**In `app/services/weather_service.py`**:

```python
from app.services.notification_service import NotificationService

class WeatherService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.notification_service = NotificationService(db)
    
    async def check_weather_alerts(self, user_id: str, farm_id: str, weather_data: dict):
        """Check weather conditions and create alerts if needed."""
        
        farm = await self.db.farms.find_one({"_id": ObjectId(farm_id)})
        farm_name = farm.get("name") if farm else None
        
        # Check for heavy rainfall
        if weather_data.get("precip_mm", 0) > 50:
            await self.notification_service.create_weather_notification(
                user_id=user_id,
                weather_alert=f"Heavy rainfall warning: {weather_data['precip_mm']}mm expected",
                severity="high",
                farm_name=farm_name
            )
        
        # Check for high winds
        if weather_data.get("wind_kph", 0) > 50:
            await self.notification_service.create_weather_notification(
                user_id=user_id,
                weather_alert=f"High wind warning: {weather_data['wind_kph']} km/h",
                severity="medium",
                farm_name=farm_name
            )
        
        # Check for extreme temperatures
        if weather_data.get("temp_c", 20) > 40:
            await self.notification_service.create_weather_notification(
                user_id=user_id,
                weather_alert=f"Extreme heat warning: {weather_data['temp_c']}°C",
                severity="high",
                farm_name=farm_name
            )
        
        # Trigger n8n webhook for additional processing
        await self.notification_service.trigger_weather_webhook(
            user_id=user_id,
            farm_id=farm_id,
            weather_data=weather_data
        )
```

### 3. API Endpoint Integration

**In `app/api/ai_chat.py`**:

```python
from app.services.disease_detection_service import DiseaseDetectionService
from app.services.notification_service import NotificationService

@router.post("/detect-disease")
async def detect_disease(
    file: UploadFile = File(...),
    farm_id: str = Form(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Initialize services
    disease_service = DiseaseDetectionService(db)
    notification_service = NotificationService(db)
    
    # Detect disease
    result = await disease_service.predict_disease(file)
    
    # Get farm name
    farm_name = None
    if farm_id:
        farm = await db.farms.find_one({"_id": ObjectId(farm_id)})
        farm_name = farm.get("name") if farm else None
    
    # Create notification
    await notification_service.create_disease_notification(
        user_id=str(current_user["_id"]),
        disease_name=result["disease_name"],
        confidence=result["confidence"],
        farm_name=farm_name
    )
    
    return {
        "success": True,
        "data": result
    }
```

### 4. Scheduled Task Integration

**Background job for daily weather checks**:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.weather_service import WeatherService
from app.services.notification_service import NotificationService

async def check_daily_weather():
    """Run daily weather check for all farms."""
    db = get_database()
    weather_service = WeatherService(db)
    notification_service = NotificationService(db)
    
    # Get all farms
    farms = await db.farms.find().to_list(length=None)
    
    for farm in farms:
        try:
            # Get weather data
            weather = await weather_service.get_weather(str(farm["_id"]))
            
            # Check for alerts
            await weather_service.check_weather_alerts(
                user_id=str(farm["user_id"]),
                farm_id=str(farm["_id"]),
                weather_data=weather
            )
        except Exception as e:
            logger.error(f"Failed to check weather for farm {farm['_id']}: {e}")

# Setup scheduler
scheduler = AsyncIOScheduler()
scheduler.add_job(check_daily_weather, 'cron', hour=6)  # Run at 6 AM daily
scheduler.start()
```

## n8n Webhook Setup

### 1. Create Workflow in n8n

1. Open n8n at `http://localhost:5678`
2. Create new workflow: **"Weather Notifications"**
3. Add **Webhook** node:
   - Method: `POST`
   - Path: `weather`
   - Response Mode: `On Received`

### 2. Process Webhook Data

Add **Code** node to parse data:

```javascript
// Parse incoming weather data
const data = items[0].json.body;

return [
  {
    json: {
      user_id: data.user_id,
      farm_id: data.farm_id,
      temperature: data.weather_data.temp_c,
      condition: data.weather_data.condition.text,
      rainfall: data.weather_data.precip_mm,
      wind: data.weather_data.wind_kph,
      alert: data.weather_data.precip_mm > 50 ? "heavy_rain" : "normal"
    }
  }
];
```

### 3. Add Notification Channels

**Option A: Email Notification**

Add **Send Email** node:
- To: User email from database
- Subject: `Weather Alert for Farm`
- Body: Template with weather data

**Option B: SMS Notification**

Add **HTTP Request** node:
- Method: `POST`
- URL: SMS API endpoint
- Body: `{"phone": "{{$json.user_phone}}", "message": "Weather alert..."}`

**Option C: Push Notification**

Add **HTTP Request** node:
- Method: `POST`
- URL: Firebase Cloud Messaging API
- Headers: `Authorization: key=YOUR_FCM_KEY`
- Body: FCM payload

### 4. Example n8n Workflow JSON

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "weather",
        "responseMode": "onReceived",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Check Severity",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.body.weather_data.precip_mm}}",
              "operation": "larger",
              "value2": 50
            }
          ]
        }
      }
    },
    {
      "name": "Send Alert Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "fromEmail": "alerts@nongdanai.com",
        "toEmail": "={{$json.body.user_email}}",
        "subject": "⚠️ Heavy Rain Alert",
        "text": "Heavy rainfall ({{$json.body.weather_data.precip_mm}}mm) expected for your farm."
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Check Severity"}]]
    },
    "Check Severity": {
      "main": [
        [{"node": "Send Alert Email"}],
        []
      ]
    }
  }
}
```

## Notification Types

### Disease Detection

**Title**: `Plant Disease Detected`

**Message**: `{disease_name} detected in {farm_name} with {confidence}% confidence`

**Metadata**:
```json
{
  "disease_name": "Tomato Late Blight",
  "confidence": 0.95,
  "farm_id": "507f1f77bcf86cd799439011",
  "farm_name": "Nông trại Hòa Bình",
  "detection_time": "2024-01-15T10:30:00Z"
}
```

### Weather Alert

**Title**: `Weather Alert for {farm_name}`

**Message**: `{weather_alert}`

**Severity Levels**:
- `low`: Minor conditions (e.g., light rain)
- `medium`: Moderate conditions (e.g., strong wind)
- `high`: Severe conditions (e.g., heavy rain, extreme heat)

**Metadata**:
```json
{
  "severity": "high",
  "farm_id": "507f1f77bcf86cd799439011",
  "farm_name": "Nông trại Hòa Bình",
  "alert_type": "rainfall",
  "alert_value": 75.5,
  "alert_time": "2024-01-15T10:30:00Z"
}
```

### System Notification

**Title**: Custom title

**Message**: Custom message

**Metadata**: Custom data

## Best Practices

### 1. Error Handling

Always wrap notification creation in try-except:

```python
try:
    await notification_service.create_disease_notification(
        user_id=user_id,
        disease_name=disease_name
    )
except Exception as e:
    logger.error(f"Failed to create notification: {e}")
    # Don't fail the main operation if notification fails
```

### 2. Asynchronous Operations

Use `await` properly for all async operations:

```python
# ✅ Correct
notification = await notification_service.create_notification(...)

# ❌ Wrong
notification = notification_service.create_notification(...)
```

### 3. Rate Limiting

Avoid spamming users with too many notifications:

```python
async def should_send_notification(user_id: str, notification_type: str) -> bool:
    """Check if user hasn't received similar notification recently."""
    recent = await db.notifications.find_one({
        "user_id": ObjectId(user_id),
        "type": notification_type,
        "created_at": {"$gte": datetime.now() - timedelta(hours=1)}
    })
    return recent is None

# Use before creating notification
if await should_send_notification(user_id, "disease"):
    await notification_service.create_disease_notification(...)
```

### 4. User Preferences

Check user notification preferences:

```python
async def get_user_preferences(user_id: str) -> dict:
    """Get user's notification preferences."""
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user.get("notification_preferences", {
        "disease_alerts": True,
        "weather_alerts": True,
        "system_notifications": True
    })

# Check before sending
preferences = await get_user_preferences(user_id)
if preferences.get("disease_alerts", True):
    await notification_service.create_disease_notification(...)
```

### 5. Logging

Log notification creation for debugging:

```python
import logging

logger = logging.getLogger(__name__)

# Log notification creation
logger.info(f"Creating disease notification for user {user_id}: {disease_name}")
notification = await notification_service.create_disease_notification(...)
logger.info(f"Notification created: {notification.id}")
```

### 6. Testing

Test notification creation in unit tests:

```python
import pytest
from app.services.notification_service import NotificationService

@pytest.mark.asyncio
async def test_create_disease_notification(db):
    service = NotificationService(db)
    
    notification = await service.create_disease_notification(
        user_id="507f1f77bcf86cd799439011",
        disease_name="Tomato Late Blight",
        confidence=0.95
    )
    
    assert notification.type == "disease"
    assert notification.title == "Plant Disease Detected"
    assert "Tomato Late Blight" in notification.message
    assert notification.metadata["confidence"] == 0.95
```

## Environment Configuration

Add to `.env`:

```bash
# n8n Webhook URL
N8N_WEBHOOK_URL=http://localhost:5678/webhook/weather

# For production
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/weather
```

## Troubleshooting

### Notifications Not Created

```python
# Check database connection
try:
    await db.notifications.count_documents({})
    print("Database connected")
except Exception as e:
    print(f"Database error: {e}")

# Check user_id format
from bson import ObjectId
try:
    ObjectId(user_id)
    print("Valid ObjectId")
except:
    print("Invalid ObjectId format")
```

### n8n Webhook Not Triggered

```bash
# Test webhook manually
curl -X POST http://localhost:5678/webhook/weather \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "507f1f77bcf86cd799439011",
    "farm_id": "507f1f77bcf86cd799439012",
    "weather_data": {"temp_c": 25}
  }'

# Check n8n logs
docker-compose logs n8n
```

### Webhook URL Not Set

```python
# Check environment variable
import os
print(f"N8N_WEBHOOK_URL: {os.getenv('N8N_WEBHOOK_URL')}")

# If not set, webhook won't be triggered (expected behavior)
```

## Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [MongoDB Motor Documentation](https://motor.readthedocs.io/)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
