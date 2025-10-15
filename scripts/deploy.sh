#!/bin/bash

# Production Deployment Script
# This script deploys Funnder to production

set -e

echo "🚀 Deploying Funnder to production..."

# Check if required environment variables are set
check_env() {
    if [ -z "${!1}" ]; then
        echo "❌ $1 is not set"
        exit 1
    else
        echo "✅ $1 is set"
    fi
}

echo "📋 Checking environment variables..."
check_env "DATABASE_URL"
check_env "NODE_ENV"

# Build the application
echo "🔨 Building application..."
pnpm install --frozen-lockfile
pnpm type-check
pnpm lint
pnpm test
pnpm build

# Run database migrations
echo "🔄 Running database migrations..."
pnpm db:push

# Seed production data (optional)
if [ "$SEED_PRODUCTION" = "true" ]; then
    echo "🌱 Seeding production database..."
    pnpm db:seed
fi

# Start the application
echo "🎯 Starting production server..."
pnpm start
