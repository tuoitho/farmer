# Deployment Guide

Complete deployment guide for **NÔNG DÂN AI** in development, staging, and production environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Cloud Platforms](#cloud-platforms)
- [ML Model Deployment](#ml-model-deployment)
- [Environment Configuration](#environment-configuration)
- [Security Checklist](#security-checklist)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd nong-dan-ai/backend

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with your values

# 3. Deploy with Docker
docker-compose up -d

# 4. Verify
curl http://localhost:8000/health
```

## Prerequisites

### Development

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Python**: 3.10+ (for local dev)
- **RAM**: 2GB minimum (4GB recommended)
- **Disk**: 5GB free space

### Production

- **Docker**: 20.10+
- **RAM**: 4GB minimum (8GB+ recommended)
- **Disk**: 20GB free space (for logs, models, backups)
- **CPU**: 2+ cores recommended
- **Network**: HTTPS/SSL certificate
- **Domain**: Configured DNS

### System Dependencies

**Ubuntu/Debian**:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Install optional tools
sudo apt-get install git curl nginx certbot
```

**CentOS/RHEL**:
```bash
# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Docker Deployment

### Local Development

```bash
# 1. Create environment file
cp .env.example .env

# 2. Edit configuration (see Environment Configuration section)
nano .env

# 3. Build and start
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f api

# 6. Access services
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# n8n: http://localhost:5678
```

### Production with Docker

**1. Update docker-compose.yml**:
```yaml
version: '3.8'

services:
  api:
    build: .
    container_name: nongdanai-api-prod
    restart: always
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - MONGODB_URI=mongodb://mongodb:27017
    volumes:
      - ./app/ai:/app/app/ai:ro  # Read-only model
      - ./logs:/app/logs          # Persistent logs
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  mongodb:
    image: mongo:7.0
    container_name: nongdanai-mongodb-prod
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
      - ./backups:/backups
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    container_name: nongdanai-n8n-prod
    restart: always
    environment:
      - N8N_PORT=5678
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"

volumes:
  mongodb_data:
  n8n_data:

networks:
  default:
    name: nongdanai-network
```

**2. Create production .env**:
```bash
# Copy and edit
cp .env.example .env.production

# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET_KEY
openssl rand -base64 32  # For MONGO_ROOT_PASSWORD
```

**3. Deploy**:
```bash
# Build with production config
docker-compose -f docker-compose.yml --env-file .env.production up -d --build

# Verify
docker-compose ps
docker-compose logs -f
```

## Production Deployment

### Without Docker (Manual)

**1. Install Python and Dependencies**:
```bash
# Install Python 3.10
sudo apt-get update
sudo apt-get install -y python3.10 python3.10-venv python3-pip

# Install system dependencies for ML
sudo apt-get install -y gcc g++ libgomp1 python3.10-dev

# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate

# Install requirements
pip install --upgrade pip
pip install -r requirements.txt
```

**2. Install MongoDB**:
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable
sudo systemctl start mongod
sudo systemctl enable mongod
```

**3. Configure MongoDB**:
```bash
# Create admin user
mongosh
> use admin
> db.createUser({
    user: "admin",
    pwd: "STRONG_PASSWORD",
    roles: ["root"]
  })

# Edit config to enable auth
sudo nano /etc/mongod.conf

# Add:
security:
  authorization: enabled

# Restart
sudo systemctl restart mongod
```

**4. Setup Application**:
```bash
# Create application directory
sudo mkdir -p /opt/nongdanai
sudo chown $USER:$USER /opt/nongdanai

# Clone repository
cd /opt/nongdanai
git clone <repository-url> .

# Create .env
cp .env.example .env
nano .env  # Edit with production values

# Place ML model
cp disease_detection.h5 app/ai/

# Test application
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**5. Setup Systemd Service**:
```bash
# Create service file
sudo nano /etc/systemd/system/nongdanai.service
```

Content:
```ini
[Unit]
Description=NÔNG DÂN AI FastAPI Application
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/nongdanai
Environment="PATH=/opt/nongdanai/venv/bin"
ExecStart=/opt/nongdanai/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable nongdanai
sudo systemctl start nongdanai
sudo systemctl status nongdanai
```

**6. Setup Nginx Reverse Proxy**:
```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/nongdanai
```

Content:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;  # For image uploads

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/nongdanai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. Setup SSL with Certbot**:
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

## Cloud Platforms

### AWS EC2

**1. Launch Instance**:
- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.medium (2 vCPU, 4GB RAM) minimum
- Storage: 20GB GP3
- Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

**2. Connect and Setup**:
```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Follow "Production Deployment" steps above
```

**3. Optional - Use RDS for MongoDB**:
- Use Amazon DocumentDB (MongoDB-compatible)
- Update `MONGODB_URI` to DocumentDB endpoint

### Google Cloud Platform (GCP)

**1. Create VM Instance**:
```bash
gcloud compute instances create nongdanai-api \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server
```

**2. Setup Firewall**:
```bash
gcloud compute firewall-rules create allow-http --allow tcp:80
gcloud compute firewall-rules create allow-https --allow tcp:443
```

**3. Connect and Deploy**:
```bash
gcloud compute ssh nongdanai-api

# Follow "Production Deployment" steps
```

### DigitalOcean Droplet

**1. Create Droplet**:
- Image: Ubuntu 22.04 LTS
- Plan: Basic ($24/mo - 2GB RAM, 2 vCPU)
- Datacenter: Choose closest to users

**2. Initial Setup**:
```bash
# Add SSH key during creation or:
ssh root@your-droplet-ip

# Create non-root user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Follow "Production Deployment" steps
```

## ML Model Deployment

### Model File Setup

**1. Download/Train Model**:
```bash
# If training locally
python train_model.py --dataset PlantVillage --output disease_detection.h5

# Or download pre-trained model
wget https://your-storage.com/disease_detection.h5
```

**2. Place Model**:
```bash
# For Docker
cp disease_detection.h5 backend/app/ai/

# For manual deployment
cp disease_detection.h5 /opt/nongdanai/app/ai/
```

**3. Verify Model**:
```python
import tensorflow as tf

model = tf.keras.models.load_model('app/ai/disease_detection.h5')
print(f"Model input shape: {model.input_shape}")  # Should be (None, 150, 150, 3)
print(f"Model output shape: {model.output_shape}")  # Should be (None, 38)
```

### Model Storage Options

**Option 1: Include in Docker Image**:
```dockerfile
# In Dockerfile
COPY app/ai/disease_detection.h5 /app/app/ai/disease_detection.h5
```

**Option 2: Cloud Storage**:
```python
# Download on startup
import boto3
import os

def download_model():
    if not os.path.exists('app/ai/disease_detection.h5'):
        s3 = boto3.client('s3')
        s3.download_file('your-bucket', 'models/disease_detection.h5', 
                        'app/ai/disease_detection.h5')
```

**Option 3: Volume Mount**:
```yaml
# docker-compose.yml
volumes:
  - /mnt/models/disease_detection.h5:/app/app/ai/disease_detection.h5:ro
```

## Environment Configuration

### Development `.env`

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=nong_dan_ai_dev

# JWT
JWT_SECRET_KEY=dev-secret-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# External APIs
OPENWEATHERMAP_API_KEY=your-dev-key
OPENWEATHERMAP_API_URL=https://api.openweathermap.org/data/2.5
N8N_WEBHOOK_URL=http://localhost:5678/webhook/weather
CLOVA_STUDIO_API_KEY=your-dev-clova-key
CLOVA_STUDIO_REQUEST_ID=your-dev-request-id

# App
DEBUG=True
CORS_ORIGINS=["http://localhost:3000"]
```

### Production `.env`

```bash
# MongoDB (with authentication)
MONGODB_URI=mongodb://admin:STRONG_PASSWORD@localhost:27017/?authSource=admin
MONGODB_DB_NAME=nong_dan_ai

# JWT (generate new keys!)
JWT_SECRET_KEY=GENERATE_RANDOM_64_CHAR_HEX_STRING
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# External APIs (production keys)
OPENWEATHERMAP_API_KEY=your-production-weather-key
OPENWEATHERMAP_API_URL=https://api.openweathermap.org/data/2.5
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/weather
CLOVA_STUDIO_API_KEY=your-production-clova-key
CLOVA_STUDIO_REQUEST_ID=your-production-request-id

# App
DEBUG=False
CORS_ORIGINS=["https://app.yourdomain.com"]
```

## Security Checklist

### Pre-Deployment

- [ ] Generate unique `JWT_SECRET_KEY` (32+ characters)
- [ ] Set `DEBUG=False` in production
- [ ] Configure specific `CORS_ORIGINS` (not `*`)
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords (20+ characters)
- [ ] Setup firewall (UFW/iptables)
- [ ] Configure SSL/TLS certificates
- [ ] Update all dependencies
- [ ] Remove example/test data
- [ ] Setup secure file permissions (chmod 600 .env)

### Post-Deployment

- [ ] Change default passwords (MongoDB, n8n)
- [ ] Setup automated backups
- [ ] Configure log rotation
- [ ] Enable fail2ban for SSH
- [ ] Setup monitoring/alerts
- [ ] Document deployment procedures
- [ ] Test disaster recovery
- [ ] Schedule security updates
- [ ] Setup API rate limiting (TODO)
- [ ] Enable audit logging

### Firewall Rules

```bash
# Allow SSH (change 22 to custom port)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny all other incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable
sudo ufw enable
```

## Monitoring

### Health Check Endpoint

```bash
# Check API health
curl http://localhost:8000/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Log Monitoring

```bash
# Docker logs
docker-compose logs -f --tail=100 api

# Systemd logs
sudo journalctl -u nongdanai -f

# Application logs
tail -f /opt/nongdanai/logs/app.log
```

### Setup Prometheus + Grafana (Optional)

**1. Add to docker-compose.yml**:
```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  volumes:
    - grafana_data:/var/lib/grafana
  ports:
    - "3000:3000"
```

**2. Configure Prometheus** (`prometheus.yml`):
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nongdanai-api'
    static_configs:
      - targets: ['api:8000']
```

### Backup Strategy

**MongoDB Backup**:
```bash
# Manual backup
docker exec nongdanai-mongodb mongodump --out /backups/$(date +%Y%m%d)

# Or without Docker
mongodump --uri="mongodb://admin:password@localhost:27017" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://admin:password@localhost:27017" /backups/20240115
```

**Automated Backups** (cron):
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker exec nongdanai-mongodb mongodump --out /backups/$(date +\%Y\%m\%d) && find /backups -mtime +7 -delete
```

## Troubleshooting

### API Won't Start

```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Port 8000 already in use
sudo lsof -i :8000
sudo kill -9 PID

# 2. MongoDB not ready
docker-compose restart mongodb
sleep 10
docker-compose restart api

# 3. ML model not found
ls -lh app/ai/disease_detection.h5
```

### MongoDB Connection Failed

```bash
# Test MongoDB connection
docker exec nongdanai-mongodb mongosh --eval "db.adminCommand('ping')"

# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### TensorFlow/ML Issues

```bash
# Check model file
python -c "import tensorflow as tf; print(tf.keras.models.load_model('app/ai/disease_detection.h5').summary())"

# Check dependencies
pip list | grep tensorflow

# Reinstall if needed
pip install --force-reinstall tensorflow==2.15.0
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Limit container resources (docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 2G

# Check ML model memory
# Consider model quantization/optimization
```

### Clova Studio API Errors

```bash
# Test API key
curl -X POST "https://clovastudio.stream.ntruss.com/v1/chat-completions/HCX-003" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-NCP-CLOVASTUDIO-REQUEST-ID: YOUR_REQUEST_ID" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# Check environment variables
docker exec nongdanai-api env | grep CLOVA
```

## Rollback Procedure

```bash
# 1. Stop current deployment
docker-compose down

# 2. Checkout previous version
git log --oneline
git checkout <previous-commit>

# 3. Rebuild and start
docker-compose up -d --build

# 4. Restore database if needed
mongorestore --drop /backups/20240115
```

## Additional Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [TensorFlow Serving](https://www.tensorflow.org/tfx/guide/serving)
- [Nginx Performance Tuning](https://www.nginx.com/blog/tuning-nginx/)
- [Let's Encrypt](https://letsencrypt.org/)
