# Logo Upload with Automatic Old Logo Deletion

## Overview

The logo upload functionality has been enhanced to automatically delete old logos from the S3 bucket when a business uploads a new logo. This prevents accumulation of unused logo files in the S3 bucket and helps manage storage costs.

## How It Works

### 1. Upload Process
When a business uploads a new logo through the business dashboard:

1. The `LogoUpload` component passes the current logo URL to the upload API
2. The `/api/business/upload-logo` endpoint receives both the new file and the current logo URL
3. If a current logo exists, it's deleted from S3 before uploading the new one
4. The new logo is uploaded to S3
5. The business record is updated with the new logo URL

### 2. S3 Key Extraction
The system intelligently handles different logo URL formats:

- **S3 Key**: `logos/businessname-uuid.png` (used directly)
- **Full URL**: `https://d2rfrexwuran49.cloudfront.net/logos/businessname-uuid.png` (extracts key)
- **Invalid format**: Skips deletion to prevent errors

### 3. Error Handling
- If logo deletion fails, the upload continues (non-blocking)
- Deletion errors are logged as warnings but don't stop the upload process
- Only valid S3 keys (starting with `logos/`) are processed for deletion

## API Changes

### `/api/business/upload-logo` Endpoint

**New Parameters:**
- `currentLogo` (optional): The current logo URL to delete before uploading

**Example Request:**
```javascript
const formData = new FormData();
formData.append('logo', file);
formData.append('businessName', 'BusinessName');
formData.append('currentLogo', 'logos/old-business-uuid.png'); // Optional
```

**Response:**
```json
{
  "success": true,
  "logoUrl": "logos/businessname-new-uuid.png"
}
```

## Component Changes

### LogoUpload Component
The `LogoUpload` component now automatically passes the current logo to the API:

```typescript
// Automatically includes currentLogo in the upload request
if (currentLogo) {
  formData.append('currentLogo', currentLogo);
}
```

## Permissions

The S3 permissions policy already includes the necessary `s3:DeleteObject` permission:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:PutObjectAcl", 
    "s3:GetObject",
    "s3:DeleteObject",  // ✅ Already included
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::qrewards-media6367c-dev",
    "arn:aws:s3:::qrewards-media6367c-dev/*"
  ]
}
```

## Testing

A test script `test-logo-upload-with-delete.js` has been created to verify the functionality:

```bash
node test-logo-upload-with-delete.js
```

This script:
1. Uploads a first logo (no deletion)
2. Uploads a second logo (deletes the first)
3. Uploads a third logo (deletes the second)
4. Verifies the process works correctly

## Benefits

1. **Storage Management**: Prevents accumulation of unused logo files
2. **Cost Optimization**: Reduces S3 storage costs
3. **Clean Data**: Maintains a clean S3 bucket with only current logos
4. **Automatic**: No manual intervention required
5. **Safe**: Non-blocking deletion with proper error handling

## Backward Compatibility

- The `currentLogo` parameter is optional
- Existing uploads without the parameter continue to work
- No changes required for existing integrations 