#!/bin/bash

echo "🚀 Starting Amplify Backend Migration to GraphQL..."

# Navigate to the project directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "❌ Amplify CLI not found. Please install it first:"
    echo "npm install -g @aws-amplify/cli"
    exit 1
fi

echo "✅ Amplify CLI found"

# Check if we're in an Amplify project
if [ ! -f "amplify/backend.js" ]; then
    echo "❌ Not in an Amplify project directory"
    exit 1
fi

echo "✅ Amplify project detected"

# Deploy the updated backend
echo "🚀 Deploying updated Amplify backend..."
amplify push --yes

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully!"
    echo ""
    echo "📋 Migration Summary:"
    echo "  • Updated backend.js with comprehensive schema"
    echo "  • Migrated from minimal to full GraphQL models"
    echo "  • Updated API routes to use GraphQL"
    echo "  • Removed direct DynamoDB dependencies"
    echo ""
    echo "🔍 Next steps:"
    echo "  1. Test the new GraphQL endpoints"
    echo "  2. Verify all models are accessible"
    echo "  3. Update any remaining hardcoded table references"
    echo ""
    echo "🧪 Test the migration:"
    echo "  curl http://localhost:3000/api/test-dynamodb-connection"
else
    echo "❌ Backend deployment failed"
    exit 1
fi
