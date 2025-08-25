# Hosted Environment Fixes for QRewards

## Issues Identified

Based on the error logs from the hosted environment, several critical issues were found:

### 1. S3 Credentials Issue
- **Problem**: The `/api/business/presigned-upload` endpoint returns 500 errors
- **Root Cause**: Missing or improperly configured AWS credentials in the hosted environment
- **Impact**: Users cannot upload new logos, breaking the logo upload functionality

### 2. Logo URL Inconsistency
- **Problem**: Mixed logo URL formats causing loading failures
- **Examples**:
  - Some logos: `/market-street-cafe-logo.png` (relative paths)
  - Others: `https://amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3.s3.us-west-1.amazonaws.com/logos/PaddysPancakes-8f6755a3-35b1-4e31-94af-4e1803d23e8a.png` (full S3 URLs)
- **Impact**: Logo display failures, inconsistent user experience

### 3. S3 Bucket Access
- **Problem**: Logos stored in S3 are failing to load
- **Root Cause**: Likely IAM permissions or bucket policy issues
- **Impact**: Existing logos don't display, breaking the visual identity of businesses

## Solutions Implemented

### 1. Enhanced Presigned Upload Endpoint
**File**: `src/app/api/business/presigned-upload/route.ts`

**Changes**:
- Added comprehensive credential detection
- Enhanced error logging for debugging
- Fallback to IAM role when explicit credentials aren't available
- Better error messages for different failure scenarios

**Key Features**:
```typescript
// Add credentials if they exist in environment variables
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN }),
  };
  console.log("[presigned-upload] Using explicit credentials from environment");
} else {
  console.log("[presigned-upload] No explicit credentials found, using IAM role");
}
```

### 2. Logo URL Normalization Utilities
**File**: `src/utils/logoUtils.ts`

**Purpose**: Ensure consistent logo URL handling across the application

**Key Functions**:
- `normalizeLogoUrl()`: Converts any logo format to consistent S3 URLs
- `getLogoKey()`: Extracts S3 keys from URLs
- `isValidS3LogoUrl()`: Validates S3 URLs
- `getDefaultLogoUrl()`: Provides fallback logo

**Usage Example**:
```typescript
import { normalizeLogoUrl } from '@/utils/logoUtils';

// Convert any logo format to consistent S3 URL
const normalizedLogo = normalizeLogoUrl(business.logo);
```

### 3. Business Update Route Enhancement
**File**: `src/app/api/business/update/route.ts`

**Changes**:
- Integrated logo normalization
- Consistent logo URL storage
- Better logging for debugging

### 4. S3 Credentials Test Endpoint
**File**: `src/app/api/test-s3-credentials/route.ts`

**Purpose**: Debug S3 access issues in hosted environment

**Tests**:
- Bucket accessibility
- Logos folder listing
- Presigned URL generation
- Credential detection

## Environment Variables Required

For the hosted environment to work properly, ensure these environment variables are set:

```bash
# AWS Credentials (if using explicit credentials)
ACCESS_KEY_ID=your_access_key
SECRET_ACCESS_KEY=your_secret_key
SESSION_TOKEN=your_session_token  # Optional, for temporary credentials

# AWS Region
AWS_REGION=us-west-1
AWS_DEFAULT_REGION=us-west-1

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

## IAM Role Configuration

If using IAM roles instead of explicit credentials, ensure the role has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3",
        "arn:aws:s3:::amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3/*"
      ]
    }
  ]
}
```

## Testing the Fixes

### 1. Test S3 Credentials
```bash
curl https://your-domain.com/api/test-s3-credentials
```

**Expected Response**:
```json
{
  "success": true,
  "bucketAccessible": true,
  "logosListed": true,
  "presignedUrlGenerated": true
}
```

### 2. Test Logo Upload
- Try uploading a new logo through the business dashboard
- Check that presigned URLs are generated successfully
- Verify logos are stored in S3

### 3. Test Logo Display
- Check that existing logos load properly
- Verify new logos display correctly
- Ensure consistent URL format across the application

## Monitoring and Debugging

### Key Log Messages to Watch

**Presigned Upload**:
```
[presigned-upload] Using explicit credentials from environment
[presigned-upload] Generated presigned URL successfully ✅
```

**Business Update**:
```
🔧 Business update: Logo normalization: { original: "...", normalized: "..." }
```

**S3 Credentials Test**:
```
🧪 Test 1: Checking bucket access...
✅ Bucket is accessible
```

### Common Error Patterns

1. **Access Denied**: Check IAM permissions
2. **Invalid Credentials**: Verify environment variables
3. **Bucket Not Found**: Confirm bucket name in amplify_outputs.json
4. **Region Mismatch**: Ensure consistent region configuration

## Next Steps

1. **Deploy the fixes** to the hosted environment
2. **Test the S3 credentials endpoint** to verify access
3. **Monitor logo uploads** for successful presigned URL generation
4. **Check logo display** across different business profiles
5. **Verify consistent URL format** in the database

## Fallback Strategy

If S3 access continues to fail:

1. **Use local logo storage** temporarily
2. **Implement CDN fallback** for logo delivery
3. **Add retry logic** for failed uploads
4. **Provide user feedback** for upload failures

## Support Contacts

For additional assistance with AWS configuration:
- Check AWS Amplify documentation for hosted environment setup
- Verify IAM role permissions in AWS Console
- Review CloudWatch logs for detailed error information
