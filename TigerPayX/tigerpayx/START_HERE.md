# 🚀 PayRam Setup & Testing - Start Here

## Quick Start Guide

### Step 1: Setup PayRam Locally (5 minutes)

```bash
cd tigerpayx
npm run setup:payram
```

This will:
- ✅ Install and start PayRam Docker container
- ✅ Configure for local testing
- ✅ Generate encryption keys

**Note:** Make sure Docker is installed and running first!

### Step 2: Update Environment Variables

Edit `.env` file and set:

```bash
PAYRAM_API_URL="http://localhost:8080"
```

### Step 3: Test Connection

```bash
npm run test:payram
```

### Step 4: Test from TigerPayX

1. Start TigerPayX: `npm run dev`
2. Login to dashboard
3. Go to "Merchant" tab
4. Register a merchant
5. Check if PayRam integration works

## 📚 Detailed Guides

- **Local Setup:** `PAYRAM_LOCAL_SETUP.md`
- **Production Deployment:** `PAYRAM_DEPLOYMENT.md`
- **Troubleshooting:** See guides above

## 🆘 Quick Troubleshooting

**PayRam won't start?**
```bash
docker ps | grep payram
docker logs payram-testnet
```

**Can't connect?**
```bash
curl http://localhost:8080
```

**Need help?** Check the detailed guides!

