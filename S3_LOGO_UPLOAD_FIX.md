# S3 Logo Upload Fix for AWS Deployment

## 🚨 Issue: Logo Upload Works Locally But Not on AWS

The logo upload functionality works locally but fails when deployed on AWS due to missing IAM permissions.

## 🔧 Root Cause

When deployed on AWS, the application needs proper IAM role permissions to access S3. The current setup uses the default credential provider chain, but the IAM role doesn't have the necessary S3 permissions.

## 🛠️ Solution Steps

### 1. Update IAM Role Permissions

The application needs an IAM role with S3 permissions. Add this policy to your IAM role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::qrewards-media6367c-dev",
        "arn:aws:s3:::qrewards-media6367c-dev/*"
      ]
    }
  ]
}
```

### 2. AWS Amplify IAM Role Setup

If using AWS Amplify, you need to:

1. **Go to AWS Amplify Console**
2. **Select your app**
3. **Go to App settings > General > IAM service role**
4. **Create or update the IAM role** with the S3 permissions above

### 3. Alternative: Environment Variables (Not Recommended for Production)

For testing, you can add environment variables in Amplify:

1. **Go to AWS Amplify Console**
2. **Select your app**
3. **Go to App settings > Environment variables**
4. **Add these variables:**
   - `ACCESS_KEY_ID`: Your AWS access key
   - `SECRET_ACCESS_KEY`: Your AWS secret key
   - `REGION`: `us-west-1`

⚠️ **Warning**: Using access keys in production is not recommended. Use IAM roles instead.

## 🧪 Testing the Fix

### 1. Test S3 Access
Visit: `/api/test-s3`
This will check if the bucket is accessible.

### 2. Test Logo Upload
Visit: `/api/test-logo-upload`
This will attempt to upload a test logo and show detailed results.

### 3. Test Actual Logo Upload
Try uploading a logo through the business dashboard and check the console logs.

## 📋 Files Updated

1. **`src/app/api/business/upload-logo/route.ts`**
   - Added better error handling
   - Added environment variable support
   - Added detailed logging

2. **`src/app/api/test-logo-upload/route.ts`**
   - Created test endpoint for debugging
   - Tests S3 access and upload functionality

3. **`s3-permissions-policy.json`**
   - Created IAM policy template

## 🔍 Debugging

### Check Console Logs
Look for these log messages:
```
🔧 Logo upload: Starting upload process...
🔧 Logo upload: Environment check - ACCESS_KEY_ID exists: true/false
🔧 Logo upload: Environment check - SECRET_ACCESS_KEY exists: true/false
🔧 Logo upload: Attempting S3 upload...
🔧 Logo upload: S3 upload successful
```

### Common Error Messages

1. **Access Denied (403)**
   - IAM role missing S3 permissions
   - Solution: Add the S3 permissions policy

2. **NoSuchBucket (404)**
   - Bucket doesn't exist or wrong region
   - Solution: Check bucket name and region

3. **InvalidAccessKeyId (401)**
   - Invalid or missing credentials
   - Solution: Check environment variables or IAM role

## 🚀 Deployment Steps

1. **Update IAM Role** with S3 permissions
2. **Deploy the updated code**
3. **Test logo upload** using the test endpoints
4. **Verify functionality** in the business dashboard

## 📞 Support

If the issue persists:
1. Check AWS CloudWatch logs for detailed error messages
2. Verify IAM role permissions in AWS Console
3. Test S3 access using AWS CLI or console
4. Contact AWS support if needed 