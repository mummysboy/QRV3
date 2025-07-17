# AWS Secrets Manager Setup for QRewards

## Overview
This guide will help you set up AWS Secrets Manager to securely store your OpenAI API keys for the QRewards application.

## Prerequisites
- AWS CLI configured with appropriate permissions
- OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))
- Optional: OpenAI project key (if you have one)

## Step 1: Create AWS Secrets Manager Secrets

### Option A: Use the Setup Script (Recommended)
```bash
./setup-secrets.sh
```

### Option B: Manual Setup
```bash
# Create OpenAI API Key secret
aws secretsmanager create-secret \
  --name "qrewards/openai-api-key" \
  --description "OpenAI API Key for QRewards AI features" \
  --secret-string "sk-your-actual-openai-api-key-here" \
  --region us-west-1

# Create OpenAI Project Key secret (optional)
aws secretsmanager create-secret \
  --name "qrewards/openai-project-key" \
  --description "OpenAI Project Key for QRewards AI features" \
  --secret-string "proj-your-actual-openai-project-key-here" \
  --region us-west-1
```

## Step 2: Set Up IAM Permissions

Your application needs permission to access Secrets Manager. You can use the provided policy file:

```bash
# Create the IAM policy
aws iam create-policy \
  --policy-name QRewardsSecretsManagerPolicy \
  --policy-document file://secrets-manager-policy.json

# Attach the policy to your application's IAM role
# (You'll need to identify your application's IAM role first)
```

## Step 3: Deploy Your Application

Deploy your updated application to your hosting platform (Vercel, Netlify, etc.).

## Step 4: Test the Setup

### Test the OpenAI API
Visit: `https://www.qrewards.net/api/openai-test`

Expected response:
```json
{
  "success": true,
  "message": "OpenAI API key is valid and working",
  "keyType": "api",
  "keyPreview": "sk-...",
  "testResponse": {
    "model": "gpt-3.5-turbo",
    "usage": {...},
    "responsePreview": "Hello! This is a test message..."
  }
}
```

### Test the Enhance Description Feature
1. Go to your business dashboard
2. Create or edit a reward
3. Click the "✨ Enhance" button next to the description field
4. The description should be enhanced using AI

## Troubleshooting

### Common Issues

#### 1. "No OpenAI API key configured"
- Check that the secrets were created successfully in AWS Secrets Manager
- Verify the secret names match exactly: `qrewards/openai-api-key` and `qrewards/openai-project-key`
- Ensure your application has IAM permissions to access Secrets Manager

#### 2. "Access Denied" errors
- Check your IAM permissions
- Verify the secret ARNs in the policy match your actual secret ARNs
- Ensure your application is running in the correct AWS region (us-west-1)

#### 3. Secrets not found
- Verify the secret names are correct
- Check that the secrets exist in the us-west-1 region
- Ensure you're using the correct AWS credentials

### Debug Commands

```bash
# List all secrets
aws secretsmanager list-secrets --region us-west-1

# Get a specific secret (for testing)
aws secretsmanager get-secret-value \
  --secret-id qrewards/openai-api-key \
  --region us-west-1

# Check your AWS identity
aws sts get-caller-identity
```

## Security Best Practices

1. **Never commit API keys to your code repository**
2. **Use IAM roles instead of access keys when possible**
3. **Rotate your API keys regularly**
4. **Monitor secret access using AWS CloudTrail**
5. **Use the principle of least privilege for IAM permissions**

## Cost Considerations

- AWS Secrets Manager charges $0.40 per secret per month
- Additional charges for API calls ($0.05 per 10,000 API calls)
- For most applications, this will cost less than $1/month

## Local Development

For local development, you can still use environment variables:

```bash
# Create a .env.local file
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_PROJECT_KEY=proj-your-actual-key-here
```

The application will automatically use environment variables when available, falling back to AWS Secrets Manager in production.

## Support

If you encounter issues:
1. Check the application logs for detailed error messages
2. Verify your AWS credentials and permissions
3. Test the secrets manually using AWS CLI
4. Check the `/api/openai-test` endpoint for debugging information 