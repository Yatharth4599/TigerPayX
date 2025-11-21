#!/bin/bash

# Setup PayRam locally for testing

set -e

echo "🚀 Setting up PayRam locally..."
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop"
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if PayRam container already exists
if docker ps -a | grep -q payram-testnet; then
    echo "⚠️  PayRam container already exists"
    read -p "Do you want to remove it and create a new one? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping and removing existing container..."
        docker stop payram-testnet 2>/dev/null || true
        docker rm payram-testnet 2>/dev/null || true
    else
        echo "Starting existing container..."
        docker start payram-testnet
        echo "✅ PayRam is running at http://localhost:8080"
        exit 0
    fi
fi

# Create directory for PayRam data
echo "📁 Creating PayRam data directories..."
mkdir -p ~/payram/{log,db/postgres}

# Generate AES key
echo "🔑 Generating AES encryption key..."
AES_KEY=$(openssl rand -hex 32)
echo "Generated AES Key: $AES_KEY"
echo "⚠️  SAVE THIS KEY - You'll need it for future updates!"
echo ""

# Start PayRam container
echo "🐳 Starting PayRam Docker container..."
docker run -d \
  --name payram-testnet \
  --publish 8080:8080 \
  --publish 80:80 \
  --publish 5432:5432 \
  -e AES_KEY="$AES_KEY" \
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

echo ""
echo "⏳ Waiting for PayRam to start (30 seconds)..."
sleep 30

# Check if container is running
if docker ps | grep -q payram-testnet; then
    echo "✅ PayRam container is running!"
    echo ""
    echo "📋 PayRam Information:"
    echo "   - Backend API: http://localhost:8080"
    echo "   - Frontend: http://localhost:80"
    echo "   - Database: localhost:5432"
    echo ""
    echo "🔑 AES Key (SAVE THIS):"
    echo "   $AES_KEY"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update .env file with: PAYRAM_API_URL=http://localhost:8080"
    echo "   2. Test connection: curl http://localhost:8080"
    echo "   3. Access PayRam frontend: http://localhost"
    echo ""
    echo "To stop PayRam: docker stop payram-testnet"
    echo "To start PayRam: docker start payram-testnet"
    echo "To view logs: docker logs payram-testnet"
else
    echo "❌ PayRam container failed to start"
    echo "Check logs: docker logs payram-testnet"
    exit 1
fi

