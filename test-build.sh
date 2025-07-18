#!/bin/bash

echo "🧪 Testing build process..."

# Clean previous build artifacts
echo "📦 Cleaning previous build artifacts..."
rm -rf .next node_modules package-lock.json

# Install dependencies
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps --no-audit --no-fund

# Run build
echo "🔨 Running build..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build artifacts are in the .next directory"
else
    echo "❌ Build failed!"
    exit 1
fi 