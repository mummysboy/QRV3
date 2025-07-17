#!/bin/bash

# QRewards AWS Secrets Manager Setup Script
# This script helps you create the necessary secrets in AWS Secrets Manager

echo "🔐 QRewards AWS Secrets Manager Setup"
echo "======================================"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Function to create a secret
create_secret() {
    local secret_name=$1
    local description=$2
    local prompt_message=$3
    
    echo ""
    echo "🔑 Setting up: $description"
    echo "Secret name: $secret_name"
    echo ""
    read -p "$prompt_message: " secret_value
    
    if [ -z "$secret_value" ]; then
        echo "⚠️  Skipping $secret_name (no value provided)"
        return
    fi
    
    echo "Creating secret: $secret_name"
    aws secretsmanager create-secret \
        --name "$secret_name" \
        --description "$description" \
        --secret-string "$secret_value" \
        --region us-west-1
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully created secret: $secret_name"
    else
        echo "❌ Failed to create secret: $secret_name"
    fi
}

# Create OpenAI API Key secret
create_secret \
    "qrewards/openai-api-key" \
    "OpenAI API Key for QRewards AI features" \
    "Enter your OpenAI API key (starts with sk-)"

# Create OpenAI Project Key secret (optional)
create_secret \
    "qrewards/openai-project-key" \
    "OpenAI Project Key for QRewards AI features" \
    "Enter your OpenAI project key (starts with proj-) or press Enter to skip"

echo ""
echo "🎉 Secrets setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy your application"
echo "2. Test the AI features at: https://www.qrewards.net/api/openai-test"
echo "3. Try the enhance description feature in your reward forms"
echo ""
echo "Note: Make sure your application has the necessary IAM permissions to access these secrets." 