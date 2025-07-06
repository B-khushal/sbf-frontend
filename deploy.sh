#!/bin/bash

# SBF Florist Frontend Deployment Script
# This script helps resolve dependency issues and deploy the application

set -e  # Exit on any error

echo "🚀 Starting SBF Florist Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Clean up any existing lock files and node_modules
print_status "Cleaning up existing files..."
rm -f package-lock.json
rm -f bun.lockb
rm -rf node_modules

# Configure npm for better dependency resolution
print_status "Configuring npm..."
npm config set registry https://registry.npmjs.org/
npm config set legacy-peer-deps true
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Install dependencies with multiple fallback strategies
print_status "Installing dependencies..."

# Strategy 1: Try normal install
if npm install --legacy-peer-deps; then
    print_success "Dependencies installed successfully!"
else
    print_warning "Normal install failed, trying with force..."
    
    # Strategy 2: Try with force
    if npm install --force --legacy-peer-deps; then
        print_success "Dependencies installed with force!"
    else
        print_warning "Force install failed, trying with cache clear..."
        
        # Strategy 3: Clear cache and try again
        npm cache clean --force
        if npm install --legacy-peer-deps; then
            print_success "Dependencies installed after cache clear!"
        else
            print_error "All installation strategies failed!"
            print_error "Please check your internet connection and try again."
            exit 1
        fi
    fi
fi

# Verify critical dependencies
print_status "Verifying critical dependencies..."
if npm ls has-symbols &> /dev/null; then
    print_success "has-symbols dependency resolved successfully!"
else
    print_warning "has-symbols not found in dependency tree, but continuing..."
fi

# Build the application
print_status "Building the application..."
if npm run build:production; then
    print_success "Application built successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Check if build output exists
if [ -d "dist" ]; then
    print_success "Build output found in dist/ directory"
    print_status "Build size: $(du -sh dist | cut -f1)"
else
    print_error "Build output not found!"
    exit 1
fi

# Health check (if preview server is available)
print_status "Starting preview server for health check..."
timeout 30s npm run preview &
PREVIEW_PID=$!

# Wait a moment for server to start
sleep 5

# Check if server is responding
if curl -f http://localhost:4173 > /dev/null 2>&1; then
    print_success "Preview server is responding!"
else
    print_warning "Preview server health check failed, but build was successful"
fi

# Kill preview server
kill $PREVIEW_PID 2>/dev/null || true

print_success "🎉 Deployment preparation completed successfully!"
print_status "Your application is ready for deployment."
print_status "Build output: dist/ directory"
print_status "Next steps:"
print_status "1. Deploy the dist/ directory to your hosting platform"
print_status "2. Configure your hosting platform to serve static files"
print_status "3. Set up environment variables if needed"

echo ""
print_status "For Render.com deployment:"
print_status "- Use the render.yaml configuration file"
print_status "- Set build command to: npm install --legacy-peer-deps && npm run build:production"
print_status "- Set start command to: npm run preview"

echo ""
print_status "For other platforms:"
print_status "- Upload the dist/ directory contents"
print_status "- Configure static file serving"
print_status "- Set up proper routing for SPA"

echo ""
print_success "Deployment script completed! 🚀" 