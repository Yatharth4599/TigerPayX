#!/bin/bash

# Start TigerPayX locally for testing

set -e

echo "🚀 Starting TigerPayX Platform Locally"
echo "======================================="
echo ""

cd "$(dirname "$0")/.."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found, creating from .env.local..."
    if [ -f .env.local ]; then
        cp .env.local .env
    else
        echo "❌ No .env or .env.local found"
        exit 1
    fi
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1 || npx prisma generate

# Check if database exists
if [ ! -f prisma/dev.db ]; then
    echo "🗄️  Database not found, running migrations..."
    npx prisma migrate dev --name init > /dev/null 2>&1 || npx prisma migrate dev --name init
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting TigerPayX development server..."
echo "   Access at: http://localhost:3000"
echo ""
echo "📝 Test Accounts:"
echo "   - Sign up at: http://localhost:3000/signup"
echo "   - Or login if you have an account"
echo ""
echo "🎯 Features to Test:"
echo "   1. Wallet creation (auto on first login)"
echo "   2. Send payments (P2P)"
echo "   3. Token swaps (Jupiter)"
echo "   4. Merchant registration"
echo "   5. PayLink creation"
echo ""
echo "⚠️  Note: PayRam is optional - TigerPayX works without it"
echo "   To add PayRam later, install Docker and run: npm run setup:payram"
echo ""

# Start dev server
npm run dev

