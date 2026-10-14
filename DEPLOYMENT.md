# ShopAssist AI — Production Deployment Guide

This guide covers deploying ShopAssist AI to production environments using Docker, standalone VPS (Ubuntu/Debian), or cloud services (Render, Railway, AWS EC2, or Vercel).

---

## 1. Production Architecture

```
Internet ➔ Nginx Reverse Proxy (SSL / HTTPS)
             ├─➔ /api/*    ➔ FastAPI (Uvicorn Workers on :8000)
             └─➔ /*        ➔ Vite Static Build (HTML/JS/CSS assets)
```

---

## 2. Docker & Docker Compose Deployment (Recommended)

### A. Dockerfile for Backend (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ backend/

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

### B. Dockerfile for Frontend (`frontend/Dockerfile`)
```dockerfile
# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### C. `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/backend/database
      - ./faiss_cache:/app/backend/faiss_index
    restart: unless-stopped
    environment:
      - PYTHONIOENCODING=utf-8

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

To run:
```bash
docker-compose up --build -d
```

---

## 3. Standalone Linux VPS Deployment (Ubuntu / Nginx / Systemd)

### Step 1: Install System Prerequisites
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv nodejs npm nginx git
```

### Step 2: Setup Python Virtual Environment
```bash
git clone <repo-url> /var/www/shopassist
cd /var/www/shopassist
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### Step 3: Build the React Frontend
```bash
cd /var/www/shopassist/frontend
npm ci
npm run build
```

### Step 4: Configure Systemd Service for FastAPI
Create `/etc/systemd/system/shopassist.service`:
```ini
[Unit]
Description=ShopAssist AI FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/shopassist
Environment="PATH=/var/www/shopassist/venv/bin"
Environment="PYTHONIOENCODING=utf-8"
ExecStart=/var/www/shopassist/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable shopassist
sudo systemctl start shopassist
```

### Step 5: Configure Nginx
Create `/etc/nginx/sites-available/shopassist`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend Static Files
    location / {
        root /var/www/shopassist/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location ~ ^/(products|search|chat|recommend|similar|compare|preferences|analytics|docs|openapi.json) {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/shopassist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Performance & Memory Tuning

1. **FAISS Index Persistence**:
   - The index is automatically generated and cached under `backend/faiss_index/products.index`.
   - On server restarts, the precomputed index is loaded in `< 5ms`.
2. **CPU Multiprocessing**:
   - Sentence-transformers runs inference on CPU using Torch. For high-traffic servers with 4+ cores, set `--workers 2` or `--workers 4` in Uvicorn.
3. **Database Maintenance**:
   - SQLite handles concurrent reads with zero lock overhead. For high write volumes on search logs, WAL mode (`PRAGMA journal_mode=WAL;`) is pre-enabled.
