#!/bin/bash

# MediConnect Healthcare Platform - Setup Script
# Automated setup for development environment

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════"
echo "  MediConnect - Healthcare Appointment & Notes Platform"
echo "  Setup Script v1.0"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v)"

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 13+"
    exit 1
fi
echo "✅ PostgreSQL installed"

echo ""
echo "📦 Setting up backend..."

# Navigate to backend
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🗄️  Setting up database..."

# Create database if not exists
if psql -lqt | cut -d \| -f 1 | grep -qw mediconnect; then
    echo "✅ Database 'mediconnect' already exists"
else
    echo "📝 Creating database 'mediconnect'..."
    createdb mediconnect
    echo "✅ Database created"
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Please update .env with your configuration if needed"
else
    echo "✅ .env file exists"
fi

echo ""
echo "🔄 Running database migrations..."
npm run migrate

echo ""
echo "🌱 Seeding sample data..."
npm run seed

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📚 Next steps:"
echo ""
echo "1. Start development server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Access the API:"
echo "   Base URL: http://localhost:3001"
echo "   API Docs: http://localhost:3001/api-docs"
echo "   Health: http://localhost:3001/health"
echo ""
echo "3. Run tests:"
echo "   npm run test              # All tests"
echo "   npm run test:watch       # Watch mode"
echo ""
echo "4. Other commands:"
echo "   npm run lint             # Linting"
echo "   npm run lint:fix         # Fix linting issues"
echo "   npm run build            # Production build"
echo ""
echo "📖 Documentation:"
echo "   - README.md              # Main guide"
echo "   - QUICK_START.md         # Quick reference"
echo "   - ARCHITECTURE.md        # Design patterns"
echo ""
echo "════════════════════════════════════════════════════════════════"
