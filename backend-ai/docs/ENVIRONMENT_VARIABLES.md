# Environment Variables Reference

Complete reference for all environment variables used in **NÔNG DÂN AI**.

## Table of Contents

- [Quick Setup](#quick-setup)
- [MongoDB Configuration](#mongodb-configuration)
- [JWT Authentication](#jwt-authentication)
- [External APIs](#external-apis)
- [Clova Studio AI](#clova-studio-ai)
- [Application Settings](#application-settings)
- [Security Best Practices](#security-best-practices)

## Quick Setup

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env  # or vim, code, etc.
```

## MongoDB Configuration

### `MONGODB_URI`

**Description**: MongoDB connection string

**Required**: ✅ Yes

**Default**: `mongodb://localhost:27017`

**Format**: `mongodb://[username:password@]host[:port][/database][?options]`

**Examples**:
```bash
# Local development
MONGODB_URI=mongodb://localhost:27017

# Docker container
MONGODB_URI=mongodb://mongodb:27017

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# With authentication
MONGODB_URI=mongodb://admin:password123@localhost:27017

# Replica set
MONGODB_URI=mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0
```

### `MONGODB_DB_NAME`

**Description**: Database name to use

**Required**: ✅ Yes

**Default**: `nong_dan_ai`

**Example**:
```bash
MONGODB_DB_NAME=nong_dan_ai
```

## JWT Authentication

### `JWT_SECRET_KEY`

**Description**: Secret key for signing JWT tokens

**Required**: ✅ Yes

**Security**: ⚠️ **CRITICAL** - Must be kept secret and unique per environment

**Generation**:
```bash
# Generate secure random key (32+ characters)
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example**:
```bash
JWT_SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
```

**⚠️ Warning**: Never use example values in production! Always generate unique keys.

### `JWT_ALGORITHM`

**Description**: Algorithm used for JWT signing

**Required**: ✅ Yes

**Default**: `HS256`

**Options**:
- `HS256` (HMAC-SHA256) - Recommended for symmetric key
- `HS384` (HMAC-SHA384)
- `HS512` (HMAC-SHA512)
- `RS256` (RSA-SHA256) - For asymmetric key pairs
- `RS384`, `RS512`

**Example**:
```bash
JWT_ALGORITHM=HS256
```

### `ACCESS_TOKEN_EXPIRE_MINUTES`

**Description**: Access token expiration time in minutes

**Required**: ✅ Yes

**Default**: `15`

**Recommended**: 15-30 minutes for security balance

**Range**: 5-60 minutes

**Example**:
```bash
ACCESS_TOKEN_EXPIRE_MINUTES=15
```

### `REFRESH_TOKEN_EXPIRE_DAYS`

**Description**: Refresh token expiration time in days

**Required**: ✅ Yes

**Default**: `7`

**Recommended**: 7-30 days

**Range**: 1-90 days

**Example**:
```bash
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## External APIs

### `OPENWEATHERMAP_API_KEY`

**Description**: API key for weather service

**Required**: ✅ Yes

**Provider**: [OpenWeatherMap](https://openweathermap.org/)

**How to get**:
1. Sign up at https://home.openweathermap.org/users/sign_up
2. Verify your email
3. Go to API Keys tab
4. Copy your API key

**Free tier**: 60 calls/minute, 1,000,000 calls/month

**Example**:
```bash
OPENWEATHERMAP_API_KEY=abc123def456ghi789jkl012mno345pq
```

### `OPENWEATHERMAP_API_URL`

**Description**: Base URL for OpenWeatherMap API

**Required**: ✅ Yes

**Default**: `https://api.openweathermap.org/data/2.5`

**Example**:
```bash
OPENWEATHERMAP_API_URL=https://api.openweathermap.org/data/2.5
```

### `N8N_WEBHOOK_URL`

**Description**: Webhook URL for n8n workflow automation (weather notifications)

**Required**: ✅ Yes

**Format**: `http[s]://host:port/webhook/path`

**Examples**:
```bash
# Local development
N8N_WEBHOOK_URL=http://localhost:5678/webhook/weather

# Docker Compose
N8N_WEBHOOK_URL=http://n8n:5678/webhook/weather

# Production
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/weather
```

**Setup**:
1. Open n8n at http://localhost:5678
2. Create new workflow
3. Add Webhook node
4. Set path to `/weather`
5. Copy webhook URL

## Clova Studio AI

### `CLOVA_STUDIO_API_KEY`

**Description**: API key for Clova Studio AI chatbot

**Required**: ✅ Yes

**Provider**: [Naver Cloud Platform - Clova Studio](https://www.ncloud.com/product/aiService/clovaStudio)

**How to get**:
1. Sign up at https://www.ncloud.com/
2. Go to Clova Studio Console
3. Create new project
4. Go to Project Settings → API Keys
5. Copy "Clova Studio API Key"

**Format**: Base64 encoded string

**Example**:
```bash
CLOVA_STUDIO_API_KEY=NTA0MjU2MWZhM2I0NDEzYjljNWRiZmY4YWU5ZWJlNWE=
```

**⚠️ Note**: Do NOT include "Bearer " prefix - code will add it automatically

### `CLOVA_STUDIO_REQUEST_ID`

**Description**: Request ID for Clova Studio API calls

**Required**: ✅ Yes

**How to get**:
1. In Clova Studio Console
2. Go to Testapp → Select your model (e.g., HCX-003)
3. Copy "Request ID" from API settings

**Format**: UUID-like string

**Example**:
```bash
CLOVA_STUDIO_REQUEST_ID=d96eb5b7ab2c48bca84011d32dc26940
```

## Application Settings

### `APP_NAME`

**Description**: Application display name

**Required**: ❌ No

**Default**: `NÔNG DÂN AI`

**Example**:
```bash
APP_NAME=NÔNG DÂN AI
```

### `APP_VERSION`

**Description**: Application version number

**Required**: ❌ No

**Default**: `1.0.0`

**Format**: Semantic versioning (MAJOR.MINOR.PATCH)

**Example**:
```bash
APP_VERSION=1.0.0
```

### `DEBUG`

**Description**: Enable debug mode (detailed logging, error traces)

**Required**: ❌ No

**Default**: `False`

**Options**: `True`, `False`

**⚠️ Warning**: Never enable in production!

**Example**:
```bash
# Development
DEBUG=True

# Production
DEBUG=False
```

### `CORS_ORIGINS`

**Description**: Allowed CORS origins (comma-separated list)

**Required**: ❌ No

**Default**: `["*"]` (allows all origins)

**Format**: JSON array of URLs

**Examples**:
```bash
# Allow all (development only)
CORS_ORIGINS=["*"]

# Specific origins (production)
CORS_ORIGINS=["https://app.example.com","https://www.example.com"]

# Multiple environments
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080","https://app.example.com"]
```

## Security Best Practices

### 1. Environment File Security

```bash
# NEVER commit .env to version control
echo ".env" >> .gitignore

# Set restrictive permissions (Linux/Mac)
chmod 600 .env

# Use different .env files per environment
.env.development
.env.staging
.env.production
```

### 2. Secret Key Generation

```bash
# Always generate unique, random keys
openssl rand -hex 32

# Minimum length: 32 characters
# Use only for one environment
# Rotate regularly (quarterly)
```

### 3. API Key Protection

- Store in environment variables, never in code
- Use different keys for dev/staging/production
- Monitor API usage for anomalies
- Rotate keys if compromised
- Set up API key restrictions (IP whitelist, rate limits)

### 4. Database Security

```bash
# Use strong MongoDB credentials
MONGODB_URI=mongodb://admin:$(openssl rand -base64 32)@localhost:27017

# Enable authentication
mongod --auth

# Use SSL/TLS in production
MONGODB_URI=mongodb://user:pass@host:27017/?ssl=true
```

### 5. Production Checklist

- [ ] Generate unique `JWT_SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Configure specific `CORS_ORIGINS` (not `*`)
- [ ] Use HTTPS for all external API URLs
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Regular backup of `.env` (encrypted storage)
- [ ] Rotate secrets quarterly
- [ ] Audit access logs

## Example Configuration Files

### Development (`.env.development`)

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=nong_dan_ai_dev

# JWT
JWT_SECRET_KEY=dev-secret-key-not-for-production-use
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# APIs
WEATHER_API_KEY=your-dev-weather-api-key
WEATHER_API_URL=https://api.weatherapi.com/v1
N8N_WEBHOOK_URL=http://localhost:5678/webhook/weather
CLOVA_STUDIO_API_KEY=your-dev-clova-key
CLOVA_STUDIO_REQUEST_ID=your-dev-request-id

# App
APP_NAME=NÔNG DÂN AI (Dev)
APP_VERSION=1.0.0-dev
DEBUG=True
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]
```

### Production (`.env.production`)

```bash
# MongoDB
MONGODB_URI=mongodb://admin:STRONG_PASSWORD_HERE@mongodb-prod:27017/?authSource=admin&ssl=true
MONGODB_DB_NAME=nong_dan_ai

# JWT
JWT_SECRET_KEY=GENERATE_SECURE_RANDOM_KEY_HERE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# APIs
WEATHER_API_KEY=your-production-weather-api-key
WEATHER_API_URL=https://api.weatherapi.com/v1
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/weather
CLOVA_STUDIO_API_KEY=your-production-clova-key
CLOVA_STUDIO_REQUEST_ID=your-production-request-id

# App
APP_NAME=NÔNG DÂN AI
APP_VERSION=1.0.0
DEBUG=False
CORS_ORIGINS=["https://app.yourdomain.com","https://www.yourdomain.com"]
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Test connection
mongosh "$MONGODB_URI"

# Check if MongoDB is running
systemctl status mongod  # Linux
brew services list | grep mongodb  # Mac
```

### JWT Token Issues

```bash
# Verify token is valid
python -c "from jose import jwt; print(jwt.decode('YOUR_TOKEN', 'YOUR_SECRET', algorithms=['HS256']))"

# Check token expiration
# Token should have 'exp' claim
```

### API Key Issues

```bash
# Test Weather API
curl "https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=Hanoi"

# Test Clova Studio
curl -X POST "https://clovastudio.stream.ntruss.com/v1/chat-completions/HCX-003" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "X-NCP-CLOVASTUDIO-REQUEST-ID: YOUR_REQUEST_ID" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## Additional Resources

- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [JWT.io](https://jwt.io/) - JWT token debugger
- [WeatherAPI Documentation](https://www.weatherapi.com/docs/)
- [Clova Studio Guide](https://guide.ncloud-docs.com/docs/clovastudio-overview)
- [n8n Documentation](https://docs.n8n.io/)
- [Python dotenv](https://pypi.org/project/python-dotenv/)
