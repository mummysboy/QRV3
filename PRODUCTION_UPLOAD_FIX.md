# Production Upload Fix Guide

## Problem Summary
You're experiencing a 403 Forbidden error when trying to upload logos from your production domain (`https://www.qrewards.net`) and Amplify subdomain (`https://production-ready.d3vrqyegyhgj8x.amplifyapp.com`), but it works fine locally.

## Root Cause Analysis
The 403 error is likely caused by one or more of these issues:

1. **CloudFront CORS Configuration** - CloudFront is blocking the request due to CORS settings
2. **API Route Deployment** - The Next.js API routes might not be properly deployed in production
3. **AWS Credentials** - Different credentials or permissions between local and production
4. **Amplify Build Configuration** - The build process might not be including the API routes correctly

## Changes Made

### 1. Enhanced CORS Headers
Updated `src/app/api/business/upload-logo/route.ts`:
- Added more comprehensive CORS headers
- Added request logging for debugging
- Improved error handling

### 2. Updated Next.js Configuration
Updated `next.config.ts`:
- Added CORS headers for all API routes
- Enhanced the specific upload-logo route configuration
- Added proper CORS preflight handling

### 3. Created Test Script
Created `test-production-upload.js`:
- Tests upload functionality across all environments
- Provides detailed error analysis
- Helps identify specific issues

## Immediate Steps to Fix

### Step 1: Deploy the Changes
```bash
# Commit and push your changes
git add .
git commit -m "Fix production upload CORS issues"
git push

# Deploy to Amplify
# (This should happen automatically if you have auto-deploy enabled)
```

### Step 2: Test the Fix
```bash
# Run the test script to verify the fix
node test-production-upload.js
```

### Step 3: Check CloudFront Configuration
If the issue persists, you may need to update your CloudFront distribution:

1. Go to AWS CloudFront console
2. Find your distribution (likely serving `www.qrewards.net`)
3. Check the "Behaviors" tab
4. Ensure the API routes (`/api/*`) are properly configured
5. Add CORS headers to the CloudFront response headers policy

### Step 4: Verify AWS Credentials
Ensure your production environment has the correct AWS credentials:

1. Check Amplify environment variables
2. Verify IAM roles and permissions
3. Ensure the S3 bucket is accessible from the production environment

## CloudFront CORS Configuration

If you need to configure CloudFront CORS manually, add these response headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## Alternative Solutions

### Option 1: Use Lambda Function (Recommended)
Since you already have a Lambda function configured in `amplify/backend.ts`, consider using that instead:

1. Update the `LogoUpload.tsx` component to use the Lambda endpoint
2. Set the environment variable: `NEXT_PUBLIC_LOGO_UPLOAD_API_URL` to your Lambda URL
3. This bypasses CloudFront CORS issues entirely

### Option 2: Direct S3 Upload
Modify the upload to use direct S3 upload with presigned URLs:

1. Create a presigned URL API endpoint
2. Upload directly to S3 from the client
3. This reduces server load and avoids CORS issues

### Option 3: API Gateway
Set up an API Gateway endpoint specifically for file uploads:

1. Create a dedicated API Gateway for uploads
2. Configure CORS properly at the API Gateway level
3. Use this instead of Next.js API routes

## Debugging Steps

### 1. Check Amplify Build Logs
```bash
# View build logs in Amplify console
# Look for any errors related to API routes or CORS
```

### 2. Test API Endpoint Directly
```bash
# Test the OPTIONS request
curl -X OPTIONS https://www.qrewards.net/api/business/upload-logo \
  -H "Origin: https://www.qrewards.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### 3. Check Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try uploading a logo
4. Look for the failed request and check:
   - Request headers
   - Response headers
   - Response body

## Expected Results

After implementing these fixes, you should see:

1. ✅ Uploads work on production domain
2. ✅ Uploads work on Amplify subdomain
3. ✅ Uploads continue to work locally
4. ✅ Proper CORS headers in responses
5. ✅ No more 403 Forbidden errors

## Monitoring

After deployment, monitor these metrics:

1. **Upload Success Rate** - Should be >95%
2. **Response Times** - Should be <5 seconds
3. **Error Rates** - Should be minimal
4. **CORS Errors** - Should be eliminated

## Fallback Plan

If the CORS fix doesn't work, implement the Lambda function approach:

1. Deploy the Lambda function from `amplify/backend.ts`
2. Update the frontend to use the Lambda endpoint
3. This provides a more reliable solution for production

## Support

If you continue to experience issues:

1. Check the test script output for specific error details
2. Review Amplify build logs
3. Check CloudFront access logs
4. Verify AWS credentials and permissions
5. Consider implementing the Lambda function approach

---

**Note**: The changes made should resolve the 403 error. If the issue persists, the Lambda function approach is the most reliable solution for production environments. 