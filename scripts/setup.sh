#!/bin/bash

# Funnder Environment Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Funnder development environment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "📋 Checking required tools..."
check_tool "node"
check_tool "pnpm"
check_tool "git"
check_tool "docker"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version $(node -v) is compatible"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Set up environment files
echo "🔧 Setting up environment files..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env from env.example"
    echo "⚠️  Please update .env with your API keys"
else
    echo "✅ .env already exists"
fi

if [ ! -f frontend/.env.local ]; then
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
EOF
    echo "✅ Created frontend/.env.local"
else
    echo "✅ frontend/.env.local already exists"
fi

# Set up database
echo "🗄️  Setting up database..."
if command -v docker &> /dev/null; then
    echo "🐳 Starting PostgreSQL with Docker..."
    docker run --name funnder-postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=funnder_dev \
        -p 5433:5432 \
        -v funnder_pgdata:/var/lib/postgresql/data \
        -d postgres:15 || echo "Container might already exist"
    
    # Update DATABASE_URL in .env
    sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:postgres@localhost:5433/funnder_dev|' .env
    echo "✅ Database container started on port 5433"
else
    echo "⚠️  Docker not available. Please set up PostgreSQL manually and update DATABASE_URL in .env"
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "🔄 Running database migrations..."
pnpm db:push
pnpm db:seed

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys"
echo "2. Update frontend/.env.local with your frontend config"
echo "3. Start the development server: pnpm dev"
echo "4. Start the frontend: cd frontend && pnpm dev"
echo ""
echo "🌐 URLs:"
echo "  Backend: http://localhost:3000"
echo "  Frontend: http://localhost:3001"
echo "  Health check: http://localhost:3000/api/health"
