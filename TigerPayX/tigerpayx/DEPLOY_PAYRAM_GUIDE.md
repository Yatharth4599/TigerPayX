# 🚀 Complete PayRam Deployment Guide

## Quick Overview

PayRam is a self-hosted Docker application for merchant crypto payments. This guide covers both **local testing** and **production deployment**.

---

## 📍 Option 1: Local Deployment (For Testing)

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- 4GB+ RAM available
- Ports 80, 8080, 5432 available

### Quick Start (Automated)

```bash
cd tigerpayx
chmod +x scripts/setup-payram-local.sh
./scripts/setup-payram-local.sh
```

This script will:
- ✅ Check Docker installation
- ✅ Create data directories
- ✅ Generate AES encryption key
- ✅ Start PayRam container
- ✅ Configure for testnet

### Manual Setup

**Step 1: Create directories**
```bash
mkdir -p ~/payram/{log,db/postgres}
```

**Step 2: Generate AES key**
```bash
openssl rand -hex 32
```
**⚠️ SAVE THIS KEY** - You'll need it later!

**Step 3: Start PayRam**
```bash
docker run -d \
  --name payram-testnet \
  --publish 8080:8080 \
  --publish 80:80 \
  --publish 5432:5432 \
  -e AES_KEY="YOUR_GENERATED_KEY_HERE" \
  -e BLOCKCHAIN_NETWORK_TYPE="testnet" \
  -e SERVER="DEVELOPMENT" \
  -e POSTGRES_HOST="localhost" \
  -e POSTGRES_PORT="5432" \
  -e POSTGRES_DATABASE="payram" \
  -e POSTGRES_USERNAME="payram" \
  -e POSTGRES_PASSWORD="payram123" \
  -v "$HOME/payram:/root/payram" \
  -v "$HOME/payram/log/supervisord:/var/log" \
  -v "$HOME/payram/db/postgres:/var/lib/payram/db/postgres" \
  payramapp/payram:1.6.0
```

**Step 4: Wait for startup**
```bash
# Wait 30 seconds
sleep 30

# Check if running
docker ps | grep payram
```

**Step 5: Test connection**
```bash
curl http://localhost:8080
```

### Configure TigerPayX

Add to your `.env` file:
```bash
PAYRAM_API_URL="http://localhost:8080"
PAYRAM_API_KEY=""  # Leave empty if not required
```

### Access PayRam

- **Backend API:** http://localhost:8080
- **Frontend UI:** http://localhost:80
- **Database:** localhost:5432

---

## 🌐 Option 2: Production Deployment

### Prerequisites

1. **VPS/Cloud Server:**
   - Ubuntu 22.04 (recommended)
   - 4+ CPU cores
   - 4GB+ RAM
   - 50GB+ SSD storage
   - Docker installed

2. **Domain Name** (optional but recommended)

3. **PostgreSQL Database:**
   - Option A: Managed (AWS RDS, Google Cloud SQL, DigitalOcean, Supabase, Neon)
   - Option B: Self-hosted

### Step-by-Step Production Deployment

#### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker  # Apply group change
```

#### Step 2: Setup PostgreSQL Database

**Option A: Managed Database (Recommended)**

Use a cloud provider:
- **Supabase:** https://supabase.com (Free tier available)
- **Neon:** https://neon.tech (Free tier available)
- **DigitalOcean:** Managed PostgreSQL
- **AWS RDS:** PostgreSQL instance

Get connection details:
```
Host: your-db-host.com
Port: 5432
Database: payram
Username: your-username
Password: your-password
```

**Option B: Self-Hosted PostgreSQL**

```bash
docker run -d \
  --name payram-postgres \
  --restart unless-stopped \
  -e POSTGRES_USER=payram \
  -e POSTGRES_PASSWORD=STRONG_PASSWORD_HERE \
  -e POSTGRES_DB=payram \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Step 3: Generate AES Key

```bash
openssl rand -hex 32
```

**⚠️ SAVE THIS KEY SECURELY** - You'll need it for updates!

#### Step 4: Setup SSL (Recommended)

**Option A: Let's Encrypt (Free)**

```bash
# Install Certbot
sudo apt install certbot -y

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com

# Certificates location:
# /etc/letsencrypt/live/your-domain.com/
```

**Option B: Cloudflare (Easier)**

Use Cloudflare for SSL termination - no certificates needed on server.

#### Step 5: Deploy PayRam

Create deployment script `deploy-payram.sh`:

```bash
#!/bin/bash

# Configuration
AES_KEY="YOUR_GENERATED_AES_KEY"
DOMAIN="your-domain.com"  # Optional
POSTGRES_HOST="your-postgres-host.com"
POSTGRES_USER="payram"
POSTGRES_PASSWORD="STRONG_PASSWORD"
POSTGRES_DB="payram"

# Create data directories
mkdir -p ~/payram/{log,db/postgres}

# Deploy PayRam
docker run -d \
  --name payram-mainnet \
  --restart unless-stopped \
  --publish 8080:8080 \
  --publish 8443:8443 \
  --publish 80:80 \
  --publish 443:443 \
  -e AES_KEY="$AES_KEY" \
  -e SSL_CERT_PATH="/etc/letsencrypt/live/$DOMAIN" \
  -e BLOCKCHAIN_NETWORK_TYPE="mainnet" \
  -e SERVER="PRODUCTION" \
  -e POSTGRES_HOST="$POSTGRES_HOST" \
  -e POSTGRES_PORT="5432" \
  -e POSTGRES_DATABASE="$POSTGRES_DB" \
  -e POSTGRES_USERNAME="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -v "$HOME/payram:/root/payram" \
  -v "$HOME/payram/log:/var/log" \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  payramapp/payram:1.6.0

echo "✅ PayRam deployed!"
echo "Backend API: http://your-server-ip:8080"
echo "Frontend: http://your-server-ip:80"
```

Make it executable and run:
```bash
chmod +x deploy-payram.sh
./deploy-payram.sh
```

#### Step 6: Configure Firewall

```bash
# Allow required ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8443/tcp
sudo ufw enable
```

#### Step 7: Setup Reverse Proxy (Optional but Recommended)

**Using Nginx:**

```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/payram
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/payram /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Update TigerPayX Configuration

Add to TigerPayX environment variables (Vercel or `.env`):

```bash
PAYRAM_API_URL="https://your-domain.com"
# Or if not using reverse proxy:
# PAYRAM_API_URL="https://your-domain.com:8443"

PAYRAM_API_KEY=""  # If required by PayRam
```

Also add for client-side:
```bash
NEXT_PUBLIC_PAYRAM_API_URL="https://your-domain.com"
NEXT_PUBLIC_PAYRAM_API_KEY=""
```

---

## 🔍 Verification & Testing

### Check PayRam Status

```bash
# Check if container is running
docker ps | grep payram

# View logs
docker logs payram-mainnet

# Follow logs in real-time
docker logs -f payram-mainnet
```

### Test API Endpoints

```bash
# Test basic connection
curl http://your-server:8080

# Test merchant registration (if API is available)
curl -X POST http://your-server:8080/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Merchant",
    "settlementAddress": "YourSolanaAddress",
    "preferredToken": "USDC"
  }'
```

### Test from TigerPayX

1. Start TigerPayX
2. Go to Merchant tab
3. Register a merchant
4. Check console for PayRam response

---

## 🔧 Management Commands

### Start PayRam
```bash
docker start payram-mainnet
```

### Stop PayRam
```bash
docker stop payram-mainnet
```

### Restart PayRam
```bash
docker restart payram-mainnet
```

### View Logs
```bash
docker logs payram-mainnet
docker logs -f payram-mainnet  # Follow logs
```

### Remove PayRam (Data Preserved)
```bash
docker stop payram-mainnet
docker rm payram-mainnet
# Data is in ~/payram directory
```

---

## 🔄 Updating PayRam

```bash
# 1. Stop container
docker stop payram-mainnet

# 2. Remove container (data preserved in volumes)
docker rm payram-mainnet

# 3. Pull new image
docker pull payramapp/payram:1.6.0

# 4. Start with SAME configuration
# Use the same AES_KEY, database credentials, etc.
./deploy-payram.sh
```

---

## 🆘 Troubleshooting

### PayRam Won't Start

```bash
# Check logs
docker logs payram-mainnet

# Check if ports are in use
sudo netstat -tulpn | grep -E '8080|8443|80|443'

# Check disk space
df -h

# Check Docker
docker info
```

### Database Connection Issues

```bash
# Test database connection
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB

# Check firewall
sudo ufw status

# Check database logs (if self-hosted)
docker logs payram-postgres
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check certificate files
ls -la /etc/letsencrypt/live/your-domain.com/
```

### Cannot Connect from TigerPayX

1. **Check PayRam is running:**
   ```bash
   docker ps | grep payram
   ```

2. **Check URL in TigerPayX .env:**
   ```bash
   cat .env | grep PAYRAM
   ```

3. **Test connectivity:**
   ```bash
   curl http://your-payram-server:8080
   ```

4. **Check CORS settings** (if accessing from browser)

---

## 🔒 Security Checklist

- [ ] Use strong PostgreSQL password
- [ ] Generate unique AES key (save securely)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (only open necessary ports)
- [ ] Use managed PostgreSQL (not containerized) for production
- [ ] Regular backups of database
- [ ] Monitor logs regularly
- [ ] Keep Docker updated
- [ ] Use reverse proxy (Nginx) for better security
- [ ] Restrict database access to PayRam server only

---

## 📊 Monitoring

### Monitor Resources

```bash
# Check container stats
docker stats payram-mainnet

# Check disk usage
du -sh ~/payram

# Check memory
free -h
```

### Monitor Logs

```bash
# Real-time logs
docker logs -f payram-mainnet

# Last 100 lines
docker logs --tail 100 payram-mainnet

# Logs with timestamps
docker logs -t payram-mainnet
```

---

## 🎯 Quick Reference

### Local Development
```bash
PAYRAM_API_URL="http://localhost:8080"
```

### Production
```bash
PAYRAM_API_URL="https://your-domain.com"
# Or
PAYRAM_API_URL="https://your-domain.com:8443"
```

### Docker Image
```
payramapp/payram:1.6.0
```

### Ports
- **8080:** Backend API (HTTP)
- **8443:** Backend API (HTTPS)
- **80:** Frontend (HTTP)
- **443:** Frontend (HTTPS)
- **5432:** PostgreSQL (if self-hosted)

---

## 📚 Additional Resources

- **PayRam Docker Image:** https://hub.docker.com/r/payramapp/payram
- **PayRam Documentation:** https://docs.payram.com
- **PayRam Official Site:** https://payram.com

---

## ✅ Next Steps After Deployment

1. ✅ **Deploy PayRam** using steps above
2. ✅ **Update TigerPayX** with PayRam URL in environment variables
3. ✅ **Test integration** - Register merchant in TigerPayX
4. ✅ **Create PayLink** and test payment flow
5. ✅ **Monitor** both systems
6. ✅ **Set up backups** for database

---

## 💡 Tips

- **Start with local deployment** to test everything
- **Use managed PostgreSQL** for production (easier backups)
- **Save your AES key** - you'll need it for updates
- **Use Cloudflare** for easier SSL and DDoS protection
- **Monitor logs** regularly to catch issues early
- **Test end-to-end** before going live

---

**Need Help?** Check PayRam's official documentation or logs for specific errors.

