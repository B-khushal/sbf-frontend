@echo off
REM Production Build Script for SBF Frontend
REM This script ensures the build uses production environment variables

echo ========================================
echo SBF Frontend - Production Build
echo ========================================
echo.

REM Change to frontend directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Step 1: Clean previous build
echo [1/4] Cleaning previous build...
if exist dist (
    echo Removing dist folder...
    rmdir /s /q dist
)
if exist node_modules\.vite (
    echo Removing Vite cache...
    rmdir /s /q node_modules\.vite
)
echo ✓ Clean complete
echo.

REM Step 2: Verify production env file
echo [2/4] Checking environment configuration...
if not exist .env.production (
    echo ❌ ERROR: .env.production file not found!
    echo Please create .env.production with HTTPS URLs
    pause
    exit /b 1
)
echo ✓ Found .env.production
echo.

REM Step 3: Display current production config
echo Production Environment Variables:
echo ----------------------------------------
findstr "VITE_API_URL" .env.production
findstr "VITE_UPLOADS_URL" .env.production
findstr "NODE_ENV" .env.production
echo ----------------------------------------
echo.
echo 🔍 VERIFY: URLs should be HTTPS (not localhost)
echo Press Ctrl+C to abort if incorrect, or
pause
echo.

REM Step 4: Build with production mode
echo [3/4] Building for production...
echo Running: npm run build -- --mode production
echo.
call npm run build -- --mode production

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed with error code %ERRORLEVEL%
    echo Check the output above for errors
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo ✓ Build successful
echo.

REM Step 5: Verify build doesn't contain localhost
echo [4/4] Verifying build output...
echo Checking for localhost references in built files...
powershell -Command "& {$found = Select-String -Path '.\dist\assets\*.js' -Pattern 'localhost' -List; if ($found) { Write-Host '❌ WARNING: Found localhost in built files:' -ForegroundColor Yellow; $found | ForEach-Object { Write-Host $_.Path -ForegroundColor Red }; Write-Host 'Build may not be using production variables!' -ForegroundColor Yellow } else { Write-Host '✓ No localhost references found - build looks good!' -ForegroundColor Green }}"
echo.

echo ========================================
echo Build Process Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Review the verification output above
echo 2. If successful, commit and push:
echo    git add .
echo    git commit -m "fix: production build with HTTPS URLs"
echo    git push origin main
echo.
echo 3. Render will auto-deploy the new build
echo 4. Test payment flow on production site
echo.
echo Build output location: %CD%\dist
echo ========================================
pause
