#!/bin/bash
# Quick script to run WaitingList migration

echo "🚀 Running WaitingList migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set!"
    echo "Please set it:"
    echo 'export DATABASE_URL="postgresql://neondb_owner:npg_JRv6ruwC1DIn@ep-odd-dew-ahmwxrzs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"'
    exit 1
fi

# Run migration
npx prisma migrate deploy

echo "✅ Migration complete!"
echo "Now test the form at: https://www.tigerpayx.com/waiting-list"
