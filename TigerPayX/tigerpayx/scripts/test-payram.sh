#!/bin/bash

# Quick test script for PayRam connection

set -e

echo "🧪 Testing PayRam Connection"
echo "============================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

PAYRAM_URL="${PAYRAM_API_URL:-http://localhost:8080}"

echo "📍 PayRam URL: $PAYRAM_URL"
echo ""

# Test 1: Basic connectivity
echo "Test 1: Basic Connectivity"
if curl -s -o /dev/null -w "%{http_code}" "$PAYRAM_URL" | grep -q "200\|301\|302\|404"; then
    echo "   ✅ PayRam is reachable"
else
    echo "   ❌ Cannot reach PayRam"
    echo "   Make sure PayRam is running: docker ps | grep payram"
    exit 1
fi
echo ""

# Test 2: Check if it's PayRam
echo "Test 2: PayRam Response"
RESPONSE=$(curl -s "$PAYRAM_URL" | head -20)
if echo "$RESPONSE" | grep -qi "payram\|html"; then
    echo "   ✅ PayRam is responding"
else
    echo "   ⚠️  Unexpected response"
fi
echo ""

# Test 3: API endpoints
echo "Test 3: API Endpoints"
ENDPOINTS=("/api/merchants" "/api/verify" "/merchants" "/verify" "/v1/merchants")

for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PAYRAM_URL$endpoint" || echo "000")
    if [ "$STATUS" != "000" ]; then
        echo "   $endpoint: HTTP $STATUS"
    else
        echo "   $endpoint: ❌ Not reachable"
    fi
done
echo ""

# Test 4: Check container status
echo "Test 4: Docker Container Status"
if docker ps | grep -q payram-testnet; then
    echo "   ✅ PayRam container is running"
    CONTAINER_ID=$(docker ps | grep payram-testnet | awk '{print $1}')
    echo "   Container ID: $CONTAINER_ID"
else
    echo "   ⚠️  PayRam container not running"
    echo "   Start it with: docker start payram-testnet"
    echo "   Or setup with: ./scripts/setup-payram-local.sh"
fi
echo ""

echo "✅ Testing complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env: PAYRAM_API_URL=$PAYRAM_URL"
echo "  2. Test from TigerPayX: npm run test:payram"
echo "  3. Check PayRam logs: docker logs payram-testnet"

