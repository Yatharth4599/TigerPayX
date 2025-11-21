# PayRam Local Setup & Testing Guide

## 🚀 Quick Start

### Step 1: Setup PayRam Locally

Run the setup script:

```bash
cd tigerpayx
npm run setup:payram
```

Or manually:

```bash
./scripts/setup-payram-local.sh
```

This will:
- ✅ Check Docker installation
- ✅ Create PayRam data directories
- ✅ Generate AES encryption key
- ✅ Start PayRam Docker container
- ✅ Configure for testnet

### Step 2: Configure TigerPayX

Update `.env` file:

```bash
PAYRAM_API_URL="http://localhost:8080"
PAYRAM_API_KEY=""  # Leave empty if PayRam doesn't require auth
```

### Step 3: Test Connection

```bash
npm run test:payram
```

Or manually:

```bash
./scripts/test-payram.sh
```

### Step 4: Verify PayRam is Running

```bash
# Check container status
docker ps | grep payram

# View logs
docker logs payram-testnet

# Test API
curl http://localhost:8080
```

## 📋 PayRam Endpoints

After setup, PayRam will be available at:

- **Backend API:** http://localhost:8080
- **Frontend UI:** http://localhost:80
- **Database:** localhost:5432

## 🔧 Manual Setup

If the script doesn't work, setup manually:

### 1. Create Data Directories

```bash
mkdir -p ~/payram/{log,db/postgres}
```

### 2. Generate AES Key

```bash
openssl rand -hex 32
```

Save this key - you'll need it!

### 3. Start PayRam Container

```bash
docker run -d \
  --name payram-testnet \
  --publish 8080:8080 \
  --publish 80:80 \
  --publish 5432:5432 \
  -e AES_KEY="YOUR_GENERATED_KEY" \
  -e SSL_CERT_PATH="" \
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

### 4. Wait for Startup

```bash
# Wait 30 seconds for PayRam to start
sleep 30

# Check if running
docker ps | grep payram
```

## 🧪 Testing Integration

### Test 1: Basic Connection

```bash
curl http://localhost:8080
```

Should return HTML or API response.

### Test 2: API Endpoints

```bash
# Try merchant registration endpoint
curl -X POST http://localhost:8080/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Merchant",
    "settlementAddress": "So11111111111111111111111111111111111111112",
    "preferredToken": "USDC"
  }'
```

### Test 3: From TigerPayX

1. Start TigerPayX: `npm run dev`
2. Login to dashboard
3. Go to "Merchant" tab
4. Click "Register Merchant"
5. Fill in details and submit
6. Check console/logs for PayRam response

## 🔍 Troubleshooting

### PayRam Container Won't Start

```bash
# Check logs
docker logs payram-testnet

# Check if ports are in use
lsof -i :8080
lsof -i :80
lsof -i :5432

# Remove and recreate
docker stop payram-testnet
docker rm payram-testnet
# Then run setup script again
```

### Cannot Connect to PayRam

1. **Check container is running:**
   ```bash
   docker ps | grep payram
   ```

2. **Check logs:**
   ```bash
   docker logs payram-testnet
   ```

3. **Verify URL in .env:**
   ```bash
   cat .env | grep PAYRAM_API_URL
   ```

4. **Test connectivity:**
   ```bash
   curl http://localhost:8080
   ```

### API Endpoints Not Working

PayRam's actual API structure may differ. You may need to:

1. **Check PayRam documentation** for actual endpoints
2. **Inspect PayRam API** by accessing the frontend
3. **Update `backend/services/payramService.ts`** with correct endpoints

### Database Connection Issues

If PayRam can't connect to database:

```bash
# Check PostgreSQL is running in container
docker exec payram-testnet ps aux | grep postgres

# Check database logs
docker logs payram-testnet | grep -i postgres
```

## 📝 PayRam Management

### Start PayRam

```bash
docker start payram-testnet
```

### Stop PayRam

```bash
docker stop payram-testnet
```

### Restart PayRam

```bash
docker restart payram-testnet
```

### View Logs

```bash
docker logs payram-testnet
docker logs -f payram-testnet  # Follow logs
```

### Remove PayRam

```bash
docker stop payram-testnet
docker rm payram-testnet
# Data is preserved in ~/payram
```

## 🚀 Next Steps: Deploy Online

Once PayRam works locally:

1. **Deploy PayRam to production server** (see `PAYRAM_SETUP.md`)
2. **Update TigerPayX `.env`** with production PayRam URL
3. **Deploy TigerPayX** (see `DEPLOYMENT.md`)

## 📚 Additional Resources

- PayRam Docker Image: https://hub.docker.com/r/payramapp/payram
- PayRam Documentation: Check PayRam's official docs
- TigerPayX Integration: `backend/services/payramService.ts`

