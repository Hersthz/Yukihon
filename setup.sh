#!/bin/bash
# Development environment setup script for Yukihon

echo "🚀 Yukihon Development Setup"
echo "=============================="

# Check prerequisites
echo "\n📋 Checking prerequisites..."

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java 24+"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[^"]+')
echo "✅ Java $JAVA_VERSION found"

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not found. Please install Maven 3.9+"
    exit 1
fi
echo "✅ Maven found"

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"

echo "\n⚙️  Setting up Backend..."
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in backend/"
    echo "📝 Please create backend/.env with required configuration"
    exit 1
fi

echo "✅ .env file found"

# Build backend
echo "🔨 Building backend..."
mvn clean install -q
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

cd ..

echo "\n⚙️  Setting up Frontend..."
cd frontend

# Install dependencies
if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

cd ..

echo "\n✅ Setup complete!"
echo "\n🎯 Next steps:"
echo "1. Terminal 1 - Start backend:  cd backend && mvn spring-boot:run"
echo "2. Terminal 2 - Start frontend: cd frontend && npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend will be available at: http://localhost:8080"
