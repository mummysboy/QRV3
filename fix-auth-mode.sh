#!/bin/bash

echo "🔧 Fixing GraphQL client auth mode across all API routes..."

# Find all TypeScript/JavaScript files that contain generateClient() calls
# and update them to use { authMode: 'apiKey' }

# Update API route files
find src/app/api -name "*.ts" -o -name "*.tsx" | while read -r file; do
    if grep -q "generateClient()" "$file"; then
        echo "🔧 Updating $file..."
        # Replace generateClient() with generateClient({ authMode: 'apiKey' })
        sed -i '' 's/generateClient()/generateClient({ authMode: "apiKey" })/g' "$file"
    fi
done

# Update component files
find src/components -name "*.ts" -o -name "*.tsx" | while read -r file; do
    if grep -q "generateClient()" "$file"; then
        echo "🔧 Updating $file..."
        sed -i '' 's/generateClient()/generateClient({ authMode: "apiKey" })/g' "$file"
    fi
done

# Update page files
find src/app -name "*.ts" -o -name "*.tsx" | while read -r file; do
    if grep -q "generateClient()" "$file"; then
        echo "🔧 Updating $file..."
        sed -i '' 's/generateClient()/generateClient({ authMode: "apiKey" })/g' "$file"
    fi
done

echo "✅ Auth mode fixes completed!"
echo ""
echo "📋 Summary of changes:"
echo "  • Updated all generateClient() calls to use { authMode: 'apiKey' }"
echo "  • This should resolve the 'NoCredentials' errors"
echo "  • All GraphQL operations will now use API key authentication"
echo ""
echo "🔄 Next steps:"
echo "  1. Restart your development server"
echo "  2. Try creating a reward again"
echo "  3. The 'NoCredentials' error should be resolved"
