# PayRam Production Deployment Guide

## 🚀 Deploy PayRam Online

Once PayRam is tested locally, deploy it to production.

## Prerequisites

1. **VPS or Cloud Server** with:
   - Ubuntu 22.04 (recommended)
   - 4+ CPU cores
   - 4GB+ RAM
   - 50GB+ SSD storage
   - Docker installed

2. **Domain Name** (optional but recommended)

3. **SSL Certificate** (for HTTPS)

## Deployment Options

### Option 1: Single Server (Simple)

Deploy PayRam on the same server as TigerPayX.

### Option 2: Separate Server (Recommended)

Deploy PayRam on dedicated server for better performance.

## Step-by-Step Deployment

### Step 1: Prepare Server

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
```

### Step 2: Setup PostgreSQL Database

**Option A: External Managed Database (Recommended)**

Use cloud PostgreSQL:
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Database
- Supabase
- Neon

Get connection string:
```
postgresql://user:password@host:5432/payram
```

**Option B: Self-Hosted PostgreSQL**

```bash
docker run -d \
  --name payram-postgres \
  -e POSTGRES_USER=payram \
  -e POSTGRES_PASSWORD=STRONG_PASSWORD \
  -e POSTGRES_DB=payram \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Step 3: Generate AES Key

```bash
openssl rand -hex 32
```

**SAVE THIS KEY** - You'll need it for updates!

### Step 4: Setup SSL (Optional but Recommended)

**Option A: Let's Encrypt (Free)**

```bash
# Install Certbot
sudo apt install certbot -y

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificates will be in:
# /etc/letsencrypt/live/your-domain.com/
```

**Option B: Cloudflare (Easier)**

Use Cloudflare for SSL termination - no certificates needed on server.

### Step 5: Deploy PayRam

Create deployment script:

```bash
#!/bin/bash
# deploy-payram.sh

AES_KEY="YOUR_GENERATED_KEY"
DOMAIN="your-domain.com"
POSTGRES_HOST="your-postgres-host"
POSTGRES_USER="payram"
POSTGRES_PASSWORD="STRONG_PASSWORD"
POSTGRES_DB="payram"

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
  -v /etc/letsencrypt:/etc/letsencrypt \
  payramapp/payram:1.6.0
```

### Step 6: Configure Firewall

```bash
# Allow required ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8443/tcp
sudo ufw enable
```

### Step 7: Setup Reverse Proxy (Optional)

**Using Nginx:**

```nginx
# /etc/nginx/sites-available/payram
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 8: Update TigerPayX Configuration

Update TigerPayX `.env`:

```bash
PAYRAM_API_URL="https://your-domain.com:8443"
# Or if using reverse proxy:
PAYRAM_API_URL="https://your-domain.com"
```

## 🔒 Security Checklist

- [ ] Use strong PostgreSQL password
- [ ] Generate unique AES key
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Use managed PostgreSQL (not containerized)
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Keep Docker updated

## 📊 Monitoring

### Check PayRam Status

```bash
docker ps | grep payram
docker logs payram-mainnet
```

### Monitor Resources

```bash
docker stats payram-mainnet
```

### Check Database Connection

```bash
docker exec payram-mainnet psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;"
```

## 🔄 Updates

### Update PayRam

```bash
# 1. Stop container
docker stop payram-mainnet

# 2. Remove container (data preserved in volumes)
docker rm payram-mainnet

# 3. Pull new image
docker pull payramapp/payram:1.6.0

# 4. Start with SAME configuration
# (Use the same AES_KEY, database, etc.)
./deploy-payram.sh
```

## 🆘 Troubleshooting

### PayRam Won't Start

```bash
# Check logs
docker logs payram-mainnet

# Check ports
sudo netstat -tulpn | grep -E '8080|8443|80|443'

# Check disk space
df -h
```

### Database Connection Issues

```bash
# Test database connection
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB

# Check firewall
sudo ufw status
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

## 📝 Production Checklist

Before going live:

- [ ] PayRam tested locally
- [ ] Production database configured
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] AES key saved securely
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] TigerPayX configured with PayRam URL
- [ ] Test end-to-end payment flow

## 🎯 Next Steps

1. **Deploy PayRam** using steps above
2. **Update TigerPayX** with production PayRam URL
3. **Test integration** end-to-end
4. **Monitor** both systems
5. **Scale** as needed

