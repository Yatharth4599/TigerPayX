#!/bin/bash

# TigerPayX Production Preparation Script
# This script helps prepare the codebase for production deployment

set -e

echo "🚀 Preparing TigerPayX for Production Deployment..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the tigerpayx directory"
  exit 1
fi

# 1. Check Prisma schema
echo "📋 Step 1: Checking Prisma schema..."
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
  echo "⚠️  WARNING: Prisma schema is still using SQLite!"
  echo "   For production, you need PostgreSQL."
  echo "   Update prisma/schema.prisma: change 'sqlite' to 'postgresql'"
  read -p "   Do you want to update it now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    echo "✅ Updated Prisma schema to PostgreSQL"
  fi
else
  echo "✅ Prisma schema is configured for PostgreSQL"
fi

# 2. Check environment variables
echo ""
echo "📋 Step 2: Checking environment variables..."
if [ ! -f ".env.production.example" ]; then
  echo "⚠️  .env.production.example not found"
else
  echo "✅ Found .env.production.example"
  echo "   Review this file and set all variables in Vercel"
fi

# 3. Check for localhost references
echo ""
echo "📋 Step 3: Checking for localhost references..."
LOCALHOST_COUNT=$(grep -r "localhost" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v ".next" | grep -v ".git" | wc -l | tr -d ' ')
if [ "$LOCALHOST_COUNT" -gt 0 ]; then
  echo "⚠️  Found $LOCALHOST_COUNT localhost references"
  echo "   Most should be in documentation files (OK)"
  echo "   Review any in source code files"
else
  echo "✅ No localhost references in source code"
fi

# 4. Verify build
echo ""
echo "📋 Step 4: Verifying build configuration..."
if [ -f "vercel.json" ]; then
  echo "✅ Found vercel.json"
else
  echo "⚠️  vercel.json not found"
fi

# 5. Check dependencies
echo ""
echo "📋 Step 5: Checking dependencies..."
if [ -f "package.json" ]; then
  echo "✅ package.json found"
  echo "   Run 'npm install' to ensure all dependencies are installed"
fi

# 6. Database migration status
echo ""
echo "📋 Step 6: Database migration status..."
if [ -d "prisma/migrations" ]; then
  MIGRATION_COUNT=$(ls -1 prisma/migrations | wc -l | tr -d ' ')
  echo "✅ Found $MIGRATION_COUNT migration(s)"
else
  echo "⚠️  No migrations directory found"
  echo "   Run 'npx prisma migrate dev' to create migrations"
fi

echo ""
echo "✅ Production preparation check complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Set up PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)"
echo "   2. Set all environment variables in Vercel dashboard"
echo "   3. Update DATABASE_URL to your production database"
echo "   4. Run: DATABASE_URL='your-url' npx prisma migrate deploy"
echo "   5. Deploy to Vercel: vercel --prod"
echo ""
echo "📖 See PRODUCTION_DEPLOYMENT.md for detailed instructions"

