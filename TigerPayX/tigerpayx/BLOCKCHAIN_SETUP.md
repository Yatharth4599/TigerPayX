# Blockchain Integration Setup Guide

This guide explains how to configure and use the blockchain integration features in TigerPayX.

## Features Implemented

✅ **Password Hashing** - All passwords are hashed using bcrypt  
✅ **JWT Authentication** - Secure token-based authentication  
✅ **PostgreSQL Support** - Production-ready database configuration  
✅ **ERC-20 Token Transfers** - Real blockchain token transfers  
✅ **Wallet Connection** - MetaMask and other Web3 wallet support  

## Environment Variables

Create a `.env` file in the `tigerpayx` directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:password@localhost:5432/tigerpayx?schema=public"  # PostgreSQL for production

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Blockchain
RPC_URL="https://eth.llamarpc.com"  # Your network RPC endpoint
CHAIN_ID="1"  # 1 = Ethereum, 137 = Polygon, 56 = BSC

# Token Contract Addresses
USDT_CONTRACT_ADDRESS="0xdAC17F958D2ee523a2206206994597C13D831ec7"  # Ethereum Mainnet
USDC_CONTRACT_ADDRESS="0xA0b86991c6218b36c1d19D4a2e9Eb0c3606eB48"  # Ethereum Mainnet
BUSD_CONTRACT_ADDRESS="0x4Fabb145d64652a948d72533023f6E7A623C7C53"  # Ethereum Mainnet
TT_CONTRACT_ADDRESS=""  # Your Tiger Token contract address
```

## Database Setup

### Development (SQLite)
```bash
# Already configured by default
npx prisma db push
```

### Production (PostgreSQL)
1. Update `prisma/schema.prisma` to use `provider = "postgresql"`
2. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string
3. Run migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

## How Blockchain Transfers Work

### 1. Tiger-to-Tiger Transfers
- Instant database updates
- No blockchain transaction needed
- 0% fees
- Works between any two TigerPayX users

### 2. External Blockchain Transfers
When a user sends USDT, USDC, or BUSD to an external address or to the Tiger Token contract:

1. **Transaction Preparation**: The API prepares the transaction data
2. **Client-Side Signing**: User signs the transaction in their wallet (MetaMask, etc.)
3. **Transaction Submission**: Transaction is submitted to the blockchain
4. **Verification**: Backend verifies the transaction on-chain
5. **Balance Update**: Database is updated with the new balance

### Flow:
```
User initiates transfer
  ↓
API checks balance & prepares transaction
  ↓
Returns transaction data to client
  ↓
User signs transaction in wallet
  ↓
Transaction submitted to blockchain
  ↓
API verifies transaction
  ↓
Database updated
```

## Supported Networks

- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Binance Smart Chain** (Chain ID: 56)
- Any EVM-compatible network

## Token Support

Currently supports:
- **USDT** (Tether)
- **USDC** (USD Coin)
- **BUSD** (Binance USD)
- **TT** (Tiger Token - your custom token)

## Security Features

1. **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
2. **JWT Tokens**: Secure token-based authentication
3. **Transaction Verification**: All blockchain transactions are verified on-chain
4. **Balance Validation**: Server-side balance checks before transfers

## API Endpoints

### Authentication
- `POST /api/auth?action=signup` - Create account (returns JWT token)
- `POST /api/auth?action=login` - Login (returns JWT token)

### Wallet Operations
- `GET /api/user` - Get user profile and wallet (requires JWT)
- `GET /api/transactions` - Get transaction history (requires JWT)
- `POST /api/send` - Send tokens (requires JWT)
- `POST /api/load-money` - Load funds or connect wallet (requires JWT)
- `POST /api/verify-tx` - Verify blockchain transaction (requires JWT)

All protected endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Testing Blockchain Transfers

1. Connect your wallet (MetaMask, etc.)
2. Ensure you have test tokens in your wallet
3. Send tokens to another address or Tiger Token contract
4. The transaction will be signed in your wallet
5. Wait for blockchain confirmation
6. Check transaction status in the dashboard

## Production Deployment

1. Set strong `JWT_SECRET` in environment variables
2. Use PostgreSQL database
3. Configure production RPC endpoint
4. Set correct token contract addresses for your network
5. Enable HTTPS
6. Set up monitoring and logging

## Troubleshooting

### Transaction Fails
- Check you have enough gas (ETH/MATIC/BNB)
- Verify token contract addresses are correct
- Ensure RPC endpoint is accessible
- Check network matches your wallet

### Authentication Errors
- Verify JWT token is being sent in headers
- Check token hasn't expired
- Ensure JWT_SECRET matches between instances

### Database Errors
- Verify DATABASE_URL is correct
- Run `npx prisma generate` after schema changes
- Check database connection

