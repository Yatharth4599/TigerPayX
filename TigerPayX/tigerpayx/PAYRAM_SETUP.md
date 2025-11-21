# PayRam Integration Setup Guide

## Overview

PayRam is a **self-hosted Docker application** for merchant crypto payments on Solana. TigerPayX integrates with PayRam to enable merchant payment processing.

## Important Notes

⚠️ **PayRam is NOT a public API service** - it must be self-hosted on your own server or VPS.

## Deployment Options

### Option 1: Self-Host PayRam (Recommended for Production)

Deploy PayRam using Docker on your own server. See the [PayRam Deployment Guide](https://payram.io/docs) for complete instructions.

**Quick Start (Testnet):**
```bash
docker run -d \
  --name payram-testnet \
  --publish 8080:8080 \
  --publish 80:80 \
  --publish 5432:5432 \
  -e AES_KEY="366502f6c3e3d828d903691bcc8f46e0d009b70477076b6417cef0a3974b78e8" \
  -e BLOCKCHAIN_NETWORK_TYPE="testnet" \
  -e SERVER="DEVELOPMENT" \
  -e POSTGRES_HOST="localhost" \
  -e POSTGRES_PORT="5432" \
  -e POSTGRES_DATABASE="payram" \
  -e POSTGRES_USERNAME="payram" \
  -e POSTGRES_PASSWORD="payram123" \
  -v "home/payram:/root/payram" \
  -v "home/payram/log/supervisord:/var/log" \
  -v "home/payram/db/postgres:/var/lib/payram/db/postgres" \
  payramapp/payram:1.6.0
```

**Production Setup:**
- Use external PostgreSQL database (AWS RDS, Google Cloud SQL, etc.)
- Generate your own AES key: `openssl rand -hex 32`
- Set up SSL certificates for HTTPS
- Configure proper security settings

### Option 2: Use PayRam Without Integration (Optional)

If you don't want to self-host PayRam, you can:
1. Use TigerPayX's built-in PayLink system without PayRam verification
2. Manually verify payments on Solana blockchain
3. Integrate with a different payment processor

## TigerPayX Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# PayRam Configuration (Self-Hosted)
# Backend API runs on port 8080 (HTTP) or 8443 (HTTPS)
PAYRAM_API_URL="http://your-domain.com:8080"
# Or for HTTPS:
# PAYRAM_API_URL="https://your-domain.com:8443"

# PayRam API Key (if required by your PayRam instance)
PAYRAM_API_KEY="your-api-key-here"
```

### For Client-Side Access

If PayRam API needs to be accessed from the browser, also add:

```bash
NEXT_PUBLIC_PAYRAM_API_URL="http://your-domain.com:8080"
NEXT_PUBLIC_PAYRAM_API_KEY="your-api-key-here"
```

## PayRam API Endpoints

⚠️ **Note:** The exact API endpoints may vary. Check your PayRam instance's API documentation.

Common endpoint patterns:
- Merchant registration: `/api/merchants` (POST)
- Payment verification: `/api/verify` (POST)
- Merchant status: `/api/merchants/{id}` (GET)

## Integration Flow

1. **Merchant Registration:**
   - User registers merchant in TigerPayX
   - TigerPayX calls PayRam API to register merchant
   - PayRam returns `payramMerchantId`
   - Merchant ID stored in TigerPayX database

2. **Payment Processing:**
   - Merchant creates PayLink in TigerPayX
   - User pays via Solana transaction
   - TigerPayX sends transaction hash to PayRam for verification
   - PayRam verifies payment and confirms settlement

3. **Settlement:**
   - PayRam handles merchant settlement
   - TigerPayX updates PayLink status to "paid"

## Testing Without PayRam

If PayRam is not configured, TigerPayX will:
- ✅ Still allow merchant registration (without PayRam ID)
- ✅ Still allow PayLink creation
- ✅ Still process Solana payments
- ⚠️ Skip PayRam verification (payments marked as "pending" until manual verification)

## Troubleshooting

### PayRam Connection Errors

1. **Check PayRam is running:**
   ```bash
   docker ps | grep payram
   ```

2. **Check PayRam logs:**
   ```bash
   docker logs payram-testnet
   ```

3. **Verify API URL:**
   - Ensure `PAYRAM_API_URL` points to correct server
   - Check if using HTTP (8080) or HTTPS (8443)
   - Verify firewall allows connections

4. **Check API endpoints:**
   - PayRam API structure may differ
   - Check PayRam documentation for exact endpoints
   - Update `backend/services/payramService.ts` if needed

### CORS Issues

If accessing PayRam from browser, ensure PayRam CORS settings allow your TigerPayX domain.

## Security Considerations

1. **Never expose PayRam API publicly** without proper authentication
2. **Use HTTPS** in production
3. **Generate unique AES key** for production
4. **Use external PostgreSQL** database in production
5. **Set up proper firewall rules** for PayRam ports

## Resources

- [PayRam Official Documentation](https://payram.io/docs)
- [PayRam Docker Image](https://hub.docker.com/r/payramapp/payram)
- [PayRam GitHub](https://github.com/payram) (if available)

## Support

For PayRam-specific issues, refer to PayRam's official documentation and support channels.

