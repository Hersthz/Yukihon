@echo off
REM Development environment setup script for Yukihon (Windows)

echo.
echo 🚀 Yukihon Development Setup
echo ==============================

REM Check Java
echo.
echo 📋 Checking prerequisites...

java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found. Please install Java 24+
    exit /b 1
)
for /f "tokens=3" %%a in ('java -version 2^>^&1 ^| findstr /R "version"') do (
    echo ✅ Java %%a found
)

REM Check Maven
mvn -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven not found. Please install Maven 3.9+
    exit /b 1
)
echo ✅ Maven found

REM Check Node
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f %%a in ('node -v') do echo ✅ Node.js %%a found

REM Setup Backend
echo.
echo ⚙️  Setting up Backend...
cd backend

if not exist .env (
    echo ❌ .env file not found in backend/
    echo 📝 Please create backend/.env with required configuration
    exit /b 1
)

echo ✅ .env file found

echo 🔨 Building backend...
call mvn clean install -q
if errorlevel 1 (
    echo ❌ Backend build failed
    exit /b 1
)
echo ✅ Backend build successful

cd ..

REM Setup Frontend
echo.
echo ⚙️  Setting up Frontend...
cd frontend

if not exist node_modules (
    echo 📦 Installing frontend dependencies...
    call npm install
) else (
    echo ✅ Dependencies already installed
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo 1. Terminal 1 - Start backend:  cd backend ^&^& mvn spring-boot:run
echo 2. Terminal 2 - Start frontend: cd frontend ^&^& npm run dev
echo.
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:8080
