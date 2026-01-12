@echo off
REM Portfoliosis - One-Command Setup
REM This script sets up everything you need to run Portfoliosis

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     PORTFOLIOSIS - ONE-COMMAND SETUP                 ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)

echo ✅ npm found:
npm --version
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ npm install failed!
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed!
    echo.
) else (
    echo ✅ Dependencies already installed
    echo.
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo 🔧 Setting up Supabase...
    echo.
    echo This will ask you for your Supabase credentials.
    echo Get them from: https://supabase.com/dashboard
    echo.
    pause

    call node scripts\setup-supabase.js
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Supabase setup failed!
        echo.
        echo You can run it again with: npm run setup:supabase
        echo.
        pause
        exit /b 1
    )
) else (
    echo ✅ .env.local already exists
    echo.
    echo Testing Supabase connection...
    call node scripts\test-supabase.js
    echo.
)

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     SETUP COMPLETE! 🎉                               ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 🚀 Ready to start! Run one of these commands:
echo.
echo    npm run dev          Start development server
echo    npm run test:supabase Test Supabase connection
echo    npm run build        Build for production
echo.
pause
