# Deployment Guide 🚀

> Complete deployment instructions for LexNotar

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Migration](#database-migration)
6. [SSL/HTTPS Setup](#ssl-https-setup)
7. [Monitoring](#monitoring)
8. [Backup Strategy](#backup-strategy)

---

## ✅ Prerequisites

### Required Software
- Docker 20+ and Docker Compose
- PostgreSQL 14+ (if not using Docker)
- Node.js 18+ (for manual deployment)
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

### System Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **Operating System**: Ubuntu 20.04+, Debian 11+, or any Docker-compatible OS

---

## 🐳 Docker Deployment (Recommended)

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/barbudangabriel-gif/LexNotar.git
cd LexNotar
```

2. **Configure Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

**Important: Change these values!**
```env
POSTGRES_PASSWORD=your_secure_password_here
JWT_SECRET=generate-a-32-char-secret-here
JWT_REFRESH_SECRET=generate-another-32-char-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

3. **Build and Start**
```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

4. **Database Migration**
```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Seed initial data (optional)
docker-compose exec backend npx prisma db seed
```

5. **Access Application**
- Frontend: http://your-server-ip
- Backend API: http://your-server-ip:3000

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a service
docker-compose restart backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Update application
git pull
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U lexnotar lexnotar > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U lexnotar lexnotar
```

---

## 🔧 Manual Deployment

### Backend Deployment

1. **Install Dependencies**
```bash
cd backend
npm ci --only=production
```

2. **Configure Environment**
```bash
cp .env.example .env
nano .env
```

3. **Build Application**
```bash
npm run build
```

4. **Run Database Migrations**
```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Start with PM2**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name lexnotar-backend

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Frontend Deployment

1. **Build Application**
```bash
cd frontend
npm ci
npm run build
```

2. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/lexnotar
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/lexnotar/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/lexnotar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

1. **Install Certbot**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain Certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Auto-renewal**
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job
```

### Manual SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of nginx config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Environment Configuration

### Production .env (Backend)
```env
# Database
DATABASE_URL="postgresql://lexnotar:STRONG_PASSWORD@localhost:5432/lexnotar?schema=public"

# JWT (Use strong random strings!)
JWT_SECRET="your-production-secret-32-characters-minimum"
JWT_REFRESH_SECRET="your-production-refresh-secret-32-characters"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-production-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM="LexNotar <noreply@yourdomain.com>"

# Server
PORT=3000
NODE_ENV=production

# Optional: Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Production .env (Frontend)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Generating Secure Secrets

```bash
# Generate random secrets (Linux/Mac)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ Database Migration

### Production Migration

```bash
# Backup database first!
pg_dump -U lexnotar lexnotar > backup_$(date +%Y%m%d).sql

# Run migrations
cd backend
npx prisma migrate deploy

# If using Docker
docker-compose exec backend npx prisma migrate deploy
```

### Rollback Strategy

```bash
# Restore from backup
psql -U lexnotar lexnotar < backup_20241121.sql

# Or using Docker
cat backup_20241121.sql | docker-compose exec -T postgres psql -U lexnotar lexnotar
```

---

## 📈 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# Frontend health
curl http://localhost/health

# Database health
docker-compose exec postgres pg_isready -U lexnotar
```

### PM2 Monitoring

```bash
# Status
pm2 status

# Monitor
pm2 monit

# Logs
pm2 logs lexnotar-backend

# Metrics
pm2 web
```

### Docker Monitoring

```bash
# Container stats
docker stats

# Service health
docker-compose ps

# Logs
docker-compose logs -f --tail=100
```

### Setting up Sentry (Error Tracking)

1. **Create Sentry account**: https://sentry.io

2. **Install SDK**
```bash
cd backend
npm install @sentry/node

cd frontend
npm install @sentry/react
```

3. **Configure Backend** (`main.ts`)
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

4. **Configure Frontend** (`main.tsx`)
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

---

## 💾 Backup Strategy

### Automated Database Backups

Create backup script (`/usr/local/bin/backup-lexnotar.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/lexnotar"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U lexnotar lexnotar | gzip > $BACKUP_DIR/lexnotar_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz ./backend/uploads

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make executable:
```bash
chmod +x /usr/local/bin/backup-lexnotar.sh
```

Setup cron (daily at 2 AM):
```bash
crontab -e
```

Add line:
```
0 2 * * * /usr/local/bin/backup-lexnotar.sh >> /var/log/lexnotar-backup.log 2>&1
```

### Restore from Backup

```bash
# List backups
ls -lh /var/backups/lexnotar/

# Restore database
gunzip < /var/backups/lexnotar/lexnotar_20241121_020000.sql.gz | \
  docker-compose exec -T postgres psql -U lexnotar lexnotar

# Restore uploads
tar -xzf /var/backups/lexnotar/uploads_20241121_020000.tar.gz
```

---

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Configure CORS for production domain only
- [ ] Enable HTTPS/TLS with valid certificate
- [ ] Set up firewall (UFW/iptables)
- [ ] Configure rate limiting
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Restrict database access (localhost only)
- [ ] Setup automated backups
- [ ] Enable audit logging
- [ ] Use environment variables (never commit secrets)
- [ ] Configure CSP headers
- [ ] Enable fail2ban for SSH protection

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend
pm2 logs lexnotar-backend

# Common issues:
# - Database not reachable
# - Missing environment variables
# - Port already in use
```

### Database connection errors
```bash
# Check PostgreSQL is running
docker-compose exec postgres pg_isready
systemctl status postgresql

# Check connection string in .env
# Verify user/password/database name
```

### Frontend shows errors
```bash
# Check API URL is correct
cat frontend/.env

# Verify CORS configuration in backend
# Check browser console for specific errors
```

---

## 📞 Support

- **Documentation**: Check `/docs` folder
- **Issues**: https://github.com/barbudangabriel-gif/LexNotar/issues
- **Email**: support@lexnotar.ro

---

**Deployment completed! 🎉**
