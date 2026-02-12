#!/bin/bash

# SBF Frontend - Render Deployment Script
# This script ensures proper build and routing configuration for Render.com

echo "🏗️  Building SBF Frontend for Render..."

# Install dependencies
npm ci

# Run build
npm run build

# Ensure _redirects file is copied to dist for SPA routing
echo "📄 Copying routing configuration..."
if [ -f "public/_redirects" ]; then
  cp public/_redirects dist/_redirects
  echo "✅ _redirects file copied to dist/"
else
  echo "⚠️  Warning: public/_redirects not found"
fi

# Create explicit index.html routing backup
echo "📝 Creating routing fallback..."
cat > dist/_redirects << 'EOF'
# SBF Frontend - SPA Routing Configuration
# All routes should be handled by React Router

# Static assets (don't redirect)
/images/*    /images/:splat    200
/sounds/*    /sounds/:splat    200
/fonts/*     /fonts/:splat     200
/assets/*    /assets/:splat    200
/vite.svg    /vite.svg         200
/favicon.ico /favicon.ico      200

# Health check
/health      /health           200

# All other routes -> index.html for React Router
/*           /index.html       200
EOF

echo "✅ Build completed successfully!"
echo "📦 Output directory: dist/"
ls -la dist/

# Verify critical files exist
if [ -f "dist/index.html" ]; then
  echo "✅ index.html found"
else
  echo "❌ ERROR: index.html not found in dist/"
  exit 1
fi

if [ -f "dist/_redirects" ]; then
  echo "✅ _redirects found"
else
  echo "⚠️  Warning: _redirects not found in dist/"
fi

echo "🚀 Ready for deployment!"
