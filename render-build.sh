#!/bin/bash

# Build script for Render deployment
# This ensures proper SPA routing by copying index.html to 404.html

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Copy index.html to 404.html for SPA routing fallback
echo "📄 Setting up SPA routing fallback..."
cp dist/index.html dist/404.html

echo "✅ Build complete! Files in dist/:"
ls -la dist/

echo "✅ Render build completed successfully!"
