# Quick Fix for React Hooks Error - Run this NOW

Write-Host "🛑 STOP the dev server first (Ctrl+C in the terminal running npm run dev)" -ForegroundColor Red
Write-Host "Press any key once you've stopped the dev server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🔄 Quick fix starting..." -ForegroundColor Cyan

# Navigate to sbf-main
Set-Location "C:\Users\acer\Documents\SBF\SBF-Copy\sbf-main"

# Clean caches only
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

Write-Host "✅ Cache cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Now run: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "If the error persists, run: .\fix-react-hooks.ps1 for a complete reinstall" -ForegroundColor Yellow
