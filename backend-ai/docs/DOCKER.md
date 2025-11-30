# Docker Deployment Guide

Complete guide for deploying NÔNG DÂN AI using Docker and Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Container Management](#container-management)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Performance Tuning](#performance-tuning)

## Prerequisites

### System Requirements

- **CPU**: 2+ cores recommended (for TensorFlow)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space
- **OS**: Linux, Windows 10/11, macOS

### Software Requirements

- Docker 20.10 or later
- Docker Compose 2.0 or later

### Installation

#### Windows
```bash
# Install Docker Desktop
https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker-compose --version
```

#### macOS
```bash
# Install via Homebrew
brew install --cask docker

# Verify
docker --version
docker-compose --version
```

## Architecture

### Services Overview

```
┌─────────────────────────────────────────┐
│         NÔNG DÂN AI System              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐  │
│  │   API    │◄─┤ MongoDB  │  │ n8n  │  │
│  │ FastAPI  │  │ Database │  │Workflow│ │
│  │  :8000   │  │  :27017  │  │ :5678 │  │
│  └──────────┘  └──────────┘  └──────┘  │
│       │              │            │     │
│       └──────────────┴────────────┘     │
│          nong-dan-ai-network            │
└─────────────────────────────────────────┘
```

### Container Details

| Container | Base Image | Purpose | Exposed Port |
|-----------|------------|---------|--------------|
| `nong-dan-ai-api` | python:3.10-slim | FastAPI backend with AI | 8000 |
| `nong-dan-ai-mongodb` | mongo:7.0 | Database | 27017 |
| `nong-dan-ai-n8n` | n8nio/n8n:latest | Workflow automation | 5678 |

### Volume Mounts

| Volume | Purpose | Persistence |
|--------|---------|-------------|
| `mongodb_data` | MongoDB data files | Yes |
| `mongodb_config` | MongoDB configuration | Yes |
| `n8n_data` | n8n workflows | Yes |
| `./app` | API source code (dev only) | No |

## Quick Start

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd farmer/backend

# Create environment file
cp .env.example .env

# Edit configuration
nano .env  # or vim, code, etc.
```

### 2. Configure Environment

Required variables in `.env`:

```bash
# Security (CHANGE THESE!)
JWT_SECRET_KEY=generate-strong-random-key-min-32-chars

# API Keys
OPENWEATHERMAP_API_KEY=your-openweathermap-key
CLOVA_STUDIO_API_KEY=your-clova-api-key
CLOVA_STUDIO_REQUEST_ID=your-request-id
```

### 3. Place AI Model

```bash
# Create AI directory
mkdir -p app/ai

# Copy your trained model
cp /path/to/disease_detection.h5 app/ai/
```

### 4. Start Services

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

### 5. Verify Deployment

```bash
# Check health
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy"}

# Access Swagger UI
open http://localhost:8000/docs
```

## Configuration

### Environment Variables

Full list of configurable variables:

```bash
# MongoDB
MONGODB_URI=mongodb://mongodb:27017
MONGODB_DB_NAME=nong_dan_ai

# JWT Authentication
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# External APIs
OPENWEATHERMAP_API_KEY=your-key
OPENWEATHERMAP_API_URL=https://api.openweathermap.org/data/2.5
N8N_WEBHOOK_URL=http://n8n:5678/webhook/weather

# Clova Studio
CLOVA_STUDIO_API_KEY=your-key
CLOVA_STUDIO_REQUEST_ID=your-id

# Application
APP_NAME=NÔNG DÂN AI
APP_VERSION=1.0.0
DEBUG=False
CORS_ORIGINS=["http://localhost:3000"]
```

### Docker Compose Customization

#### Change Ports

Edit `docker-compose.yml`:

```yaml
services:
  api:
    ports:
      - "8080:8000"  # Map to different host port
  
  mongodb:
    ports:
      - "27018:27017"  # Avoid port conflict
```

#### Resource Limits

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

#### Development Mode

Mount source code for hot reload:

```yaml
services:
  api:
    volumes:
      - ./app:/app/app
      - ./main.py:/app/main.py
    command: uvicorn main:app --reload --host 0.0.0.0
```

## Container Management

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: data loss)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f mongodb
docker-compose logs -f n8n

# Last 100 lines
docker-compose logs --tail=100 api

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00 api
```

### Execute Commands in Container

```bash
# Access API container shell
docker-compose exec api bash

# Run Python command
docker-compose exec api python -c "print('Hello')"

# Access MongoDB shell
docker-compose exec mongodb mongosh nong_dan_ai

# Check n8n status
docker-compose exec n8n n8n --version
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api

# Force recreate
docker-compose up -d --force-recreate api
```

### Update and Rebuild

```bash
# Pull latest images
docker-compose pull

# Rebuild application
docker-compose build --no-cache api

# Apply changes
docker-compose up -d --build api
```

## Production Deployment

### Production docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: nong-dan-ai-mongodb-prod
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: nong_dan_ai
    volumes:
      - mongodb_data_prod:/data/db
    networks:
      - nong-dan-ai-network
    deploy:
      resources:
        limits:
          memory: 2G

  api:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: nong-dan-ai-api-prod
    restart: always
    environment:
      - MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - OPENWEATHERMAP_API_KEY=${OPENWEATHERMAP_API_KEY}
      - CLOVA_STUDIO_API_KEY=${CLOVA_STUDIO_API_KEY}
      - CLOVA_STUDIO_REQUEST_ID=${CLOVA_STUDIO_REQUEST_ID}
      - DEBUG=False
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    networks:
      - nong-dan-ai-network
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
      replicas: 2

networks:
  nong-dan-ai-network:
    driver: bridge

volumes:
  mongodb_data_prod:
    driver: local
```

### Production Dockerfile

Create `Dockerfile.prod`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Production server
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### Deploy to Production

```bash
# Set production environment
export COMPOSE_FILE=docker-compose.prod.yml

# Build
docker-compose build --no-cache

# Deploy
docker-compose up -d

# Scale API
docker-compose up -d --scale api=3

# Monitor
docker-compose logs -f
```

### SSL/HTTPS with Nginx

Create `docker-compose.nginx.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: nong-dan-ai-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - nong-dan-ai-network
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill process or change port in docker-compose.yml
```

#### Container Won't Start

```bash
# Check logs
docker-compose logs api

# Inspect container
docker inspect nong-dan-ai-api

# Check resource usage
docker stats
```

#### MongoDB Connection Failed

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh --eval "db.runCommand({ping: 1})"

# Verify network
docker network inspect nong-dan-ai-network
```

#### Out of Memory

```bash
# Check memory usage
docker stats --no-stream

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory

# Add memory limits in docker-compose.yml
```

#### AI Model Not Loading

```bash
# Verify model exists
docker-compose exec api ls -l app/ai/

# Check file permissions
docker-compose exec api ls -la app/ai/disease_detection.h5

# Copy model to container
docker cp /path/to/model.h5 nong-dan-ai-api:/app/app/ai/
```

### Debug Mode

Enable debug logging:

```bash
# Edit docker-compose.yml
environment:
  - DEBUG=True

# Restart
docker-compose restart api

# View detailed logs
docker-compose logs -f api
```

## Performance Tuning

### Optimize Docker Build

```dockerfile
# Use multi-stage builds
FROM python:3.10-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
```

### Database Optimization

```yaml
# MongoDB with optimized settings
mongodb:
  command: mongod --wiredTigerCacheSizeGB 1.5 --auth
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=secure_password
```

### Load Balancing

```bash
# Scale API containers
docker-compose up -d --scale api=3

# Use nginx for load balancing
# Add nginx.conf with upstream configuration
```

### Monitoring

```yaml
# Add monitoring stack
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

## Backup and Restore

### Backup MongoDB

```bash
# Create backup
docker-compose exec mongodb mongodump --out=/data/backup

# Copy to host
docker cp nong-dan-ai-mongodb:/data/backup ./backup

# Automated backup script
docker-compose exec mongodb sh -c 'mongodump --archive' > backup-$(date +%Y%m%d).archive
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ./backup nong-dan-ai-mongodb:/data/

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

## Security Best Practices

1. **Never commit `.env` file**
2. **Use strong JWT_SECRET_KEY** (min 32 characters)
3. **Change default MongoDB credentials**
4. **Enable MongoDB authentication** in production
5. **Use HTTPS** in production
6. **Limit exposed ports**
7. **Regular security updates**: `docker-compose pull`
8. **Scan images**: `docker scan nong-dan-ai-api`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [MongoDB Docker](https://hub.docker.com/_/mongo)
- [n8n Documentation](https://docs.n8n.io/)
