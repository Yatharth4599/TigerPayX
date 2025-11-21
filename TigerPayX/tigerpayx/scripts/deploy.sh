#!/bin/bash

# TigerPayX Deployment Script

set -e

echo "🚀 TigerPayX Deployment Script"
echo "================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set"
    echo "Please set DATABASE_URL environment variable"
    echo "Example: export DATABASE_URL='postgresql://user:pass@host:5432/db'"
    exit 1
fi

# Check if provider is PostgreSQL
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    echo "⚠️  WARNING: Prisma schema is set to SQLite"
    echo "For production deployment, you should use PostgreSQL"
    echo ""
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🏗️  Building application..."
npm run build

echo "✅ Build complete!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "Or deploy to Vercel:"
echo "  vercel --prod"

