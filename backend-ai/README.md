# NÔNG DÂN AI - Smart Farming Support System


### Backend
- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database with geospatial support
- **Motor** - Async MongoDB driver
- **TensorFlow** - Deep learning for disease detection
- **Argon2** - Secure password hashing
- **Clova Studio** - AI chatbot integration

### DevOps
- **Docker & Docker Compose** - Containerization
- **n8n** - Workflow automation for notifications

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farmer/backend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env` file**
   ```bash
   # Required: Set your API keys
   JWT_SECRET_KEY=your-strong-secret-key-here
   OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
   CLOVA_STUDIO_API_KEY=your-clova-api-key
   CLOVA_STUDIO_REQUEST_ID=your-request-id
   ```

4. **Place AI model**
   ```bash
   # Put your disease detection model file
   cp /path/to/disease_detection.h5 app/ai/disease_detection.h5
   ```

5. **Start all services**
   ```bash
   docker-compose up -d
   ```

6. **Check service status**
   ```bash
   docker-compose ps
   docker-compose logs -f api
   ```

### 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **API Documentation (Swagger)** | http://localhost:8000/docs | - |
| **API Documentation (ReDoc)** | http://localhost:8000/redoc | - |
| **Health Check** | http://localhost:8000/health | - |
| **n8n Workflow Editor** | http://localhost:5678 | admin / changeme |
| **MongoDB** | localhost:27017 | - |

### 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f mongodb
docker-compose logs -f n8n

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build api

# Remove all data (WARNING: deletes database)
docker-compose down -v

# Scale services
docker-compose up -d --scale api=3
```

## 💻 Local Development Setup

### Prerequisites

- Python 3.10+
- MongoDB 5.0+
- Virtual environment tool

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # Linux/Mac
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

4. **Place AI model**
   ```bash
   # Copy disease detection model
   mkdir -p app/ai
   cp /path/to/disease_detection.h5 app/ai/
   ```

5. **Start MongoDB** (if not using Docker)
   ```bash
   mongod --dbpath=/path/to/data
   ```

6. **Run development server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📁 Project Structure

```
backend/
├── app/
│   ├── ai/                      # AI models
│   │   └── disease_detection.h5 # Disease detection model
│   ├── api/                     # API endpoints
│   │   ├── auth.py             # Authentication routes
│   │   ├── farms.py            # Farm management routes
│   │   ├── weather.py          # Weather forecast routes
│   │   ├── ai_chat.py          # AI chatbot routes
│   │   └── notifications.py    # Notification routes
│   ├── core/                    # Core application
│   │   ├── config.py           # Configuration settings
│   │   ├── database.py         # MongoDB connection
│   │   ├── dependencies.py     # FastAPI dependencies
│   │   └── exception_handlers.py
│   ├── models/                  # Pydantic models
│   │   ├── user.py             # User models
│   │   ├── farm.py             # Farm models
│   │   ├── weather.py          # Weather models
│   │   ├── ai_chat.py          # AI chat models
│   │   └── api_response.py     # Standardized responses
│   └── services/                # Business logic
│       ├── auth_service.py     # Authentication service
│       ├── farm_service.py     # Farm management service
│       ├── weather_service.py  # Weather service
│       ├── disease_detection_service.py  # AI disease detection
│       ├── clova_service.py    # Clova Studio integration
│       └── notification_service.py
├── docs/                        # Documentation
│   ├── API_RESPONSE_STRUCTURE.md
│   ├── DEPLOYMENT.md
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── INPUT_VALIDATION.md
│   └── NOTIFICATION_INTEGRATION.md
├── main.py                      # Application entry point
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Multi-container setup
├── .env.example                 # Environment template
└── README.md                    # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Farm Management
- `POST /api/farms` - Create new farm
- `GET /api/farms` - List all farms (with filters)
- `GET /api/farms/{farm_id}` - Get farm details
- `PATCH /api/farms/{farm_id}` - Update farm
- `PATCH /api/farms/{farm_id}/status` - Update crop status

### Weather
- `POST /api/weather/current` - Get current weather
- `GET /api/weather/forecast/{farm_id}` - Get weather forecast

### AI Features
- `POST /api/ai/detect-disease` - Detect disease from plant image
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/health` - Check AI services health

### Notifications
- `POST /api/notifications/send` - Send notification

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=nong_dan_ai

# JWT Configuration (REQUIRED)
JWT_SECRET_KEY=your-super-secret-key-min-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Weather API (REQUIRED)
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
OPENWEATHERMAP_API_URL=https://api.openweathermap.org/data/2.5

# n8n Webhook
N8N_WEBHOOK_URL=http://localhost:5678/webhook/weather

# Clova Studio API (REQUIRED)
CLOVA_STUDIO_API_KEY=your-clova-studio-api-key
CLOVA_STUDIO_REQUEST_ID=your-request-id

# Application
APP_NAME=NÔNG DÂN AI
APP_VERSION=1.0.0
DEBUG=False
CORS_ORIGINS=["*"]
```

### Getting API Keys

#### OpenWeatherMap
1. Sign up at https://openweathermap.org/
2. Get free API key from dashboard

#### Clova Studio
1. Sign up at https://www.ncloud.com/
2. Go to Clova Studio Console
3. Create project and get API key + Request ID

## 🧪 Testing

### Test with Postman

1. **Import collection** - Use Swagger/OpenAPI export
2. **Set up environment variables**
   ```
   base_url: http://localhost:8000
   access_token: <obtained from login>
   ```

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyen Van A",
    "phone": "0123456789",
    "password": "Password123",
    "confirm_password": "Password123",
    "province": "Hanoi"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0123456789",
    "password": "Password123"
  }'

# Disease detection (with Bearer token)
curl -X POST http://localhost:8000/api/ai/detect-disease \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/plant-image.jpg"
```

## 🤖 AI Disease Detection Model

The system uses a TensorFlow deep learning model trained on PlantVillage dataset to detect 38 different plant diseases across multiple crops:

**Supported Crops:** Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato

**Input:** Plant leaf image (JPG/PNG)
**Output:** Disease name + confidence score + treatment advice from AI

**Model Specifications:**
- Input size: 150x150 pixels
- Architecture: Convolutional Neural Network
- Classes: 38 (diseases + healthy states)

## 🔐 Security Features

- **Argon2 Password Hashing** - Industry-standard secure hashing
- **JWT Token Authentication** - Stateless auth with refresh tokens
- **CORS Protection** - Configurable origins
- **Input Validation** - Pydantic models
- **SQL Injection Prevention** - MongoDB NoSQL
- **Rate Limiting** - (TODO: Add rate limiting middleware)

## 📊 Database Schema

### Collections

- **users** - User accounts
- **farms** - Farm information with GeoJSON locations
- **refresh_tokens** - JWT refresh tokens
- **notifications** - Notification history

### Indexes

```javascript
// users
db.users.createIndex({ "phone": 1 }, { unique: true })

// farms
db.farms.createIndex({ "user_id": 1 })
db.farms.createIndex({ "location": "2dsphere" })

// refresh_tokens
db.refresh_tokens.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
db.refresh_tokens.createIndex({ "token_hash": 1 })
```

## 🚢 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET_KEY` to strong random value
- [ ] Set `DEBUG=False`
- [ ] Configure proper `CORS_ORIGINS`
- [ ] Use environment-specific MongoDB URI
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set resource limits in docker-compose

### Docker Production

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Monitor
docker-compose -f docker-compose.prod.yml logs -f
```

## 🛠️ Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
docker-compose ps mongodb
docker-compose logs mongodb
```

**AI Model Not Found**
```bash
# Verify model file exists
ls -l app/ai/disease_detection.h5
```

**Import Errors**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Permission Denied (Docker)**
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

## 📚 Documentation

See `/docs` folder for detailed documentation:
- [API Response Structure](docs/API_RESPONSE_STRUCTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Input Validation](docs/INPUT_VALIDATION.md)
- [Notification Integration](docs/NOTIFICATION_INTEGRATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- PlantVillage Dataset for disease detection training
- Naver Clova Studio for AI chatbot
- OpenWeatherMap for weather data
- FastAPI community
