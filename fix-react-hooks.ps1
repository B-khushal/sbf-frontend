# Force Clean and Fix React Hooks Error
# Run this script from PowerShell

Write-Host "🔄 Starting complete cleanup and reinstall..." -ForegroundColor Cyan

# Navigate to sbf-main
Set-Location "C:\Users\acer\Documents\SBF\SBF-Copy\sbf-main"

# Stop any running processes
Write-Host "⏹️ Stopping any running dev servers..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean Vite cache
Write-Host "🧹 Cleaning Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
}
if (Test-Path ".vite") {
    Remove-Item -Recurse -Force ".vite" -ErrorAction SilentlyContinue
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
}

# Clean node_modules
Write-Host "🧹 Cleaning node_modules (this may take a moment)..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    # Try to unlock files
    Get-ChildItem -Path "node_modules" -Recurse -File | ForEach-Object {
        $_.IsReadOnly = $false
    }
    
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

# Remove package-lock
Write-Host "🧹 Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Installing dependencies (this will take a few minutes)..." -ForegroundColor Cyan

# Fresh install
npm install

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan

# Start dev server
npm run dev
