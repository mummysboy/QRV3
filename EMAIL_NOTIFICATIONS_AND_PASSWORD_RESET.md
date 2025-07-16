# Email Notifications and Password Reset Features

## Overview

This document describes the new email notification and password reset functionality that has been added to the QRewards system.

## Features Implemented

### 1. Approval Email Notifications

When an admin approves a business from the dashboard, an automatic email is sent to the business owner with:
- Congratulations message
- Business name and approval confirmation
- Login instructions and credentials
- Link to the business login page
- Next steps for getting started

**Files Modified:**
- `src/app/api/admin/update-signup-status/route.ts` - Added email sending functionality

**How it works:**
1. Admin clicks "Approve" on a business in the admin dashboard
2. System updates business status to "approved"
3. System automatically sends approval email to the primary business user
4. Email includes login link and instructions

### 2. Password Recovery System

A complete password reset flow has been implemented:

**Files Created:**
- `src/app/business/forgot-password/page.tsx` - Forgot password form
- `src/app/business/reset-password/page.tsx` - Reset password form
- `src/app/api/business/forgot-password/route.ts` - API for requesting password reset
- `src/app/api/business/reset-password/route.ts` - API for updating password

**How it works:**
1. User clicks "Forgot your password?" on login page
2. User enters their email address
3. System sends password reset email with secure token
4. User clicks link in email to reset password
5. User enters new password and confirms
6. System updates password and redirects to login

## Testing Endpoints

### Test Approval Email
```bash
POST /api/admin/test-approval-email
{
  "businessId": "your-business-id",
  "testEmail": "optional-test-email@example.com"
}
```

### Test Password Reset Email
```bash
POST /api/admin/test-password-reset
{
  "email": "user@example.com",
  "testEmail": "optional-test-email@example.com"
}
```

## Email Templates

### Approval Email Template
- **Subject:** "🎉 Your QRewards Business Account Has Been Approved!"
- **Content:** Professional approval notification with login instructions
- **Features:** Responsive design, clear call-to-action, security information

### Password Reset Email Template
- **Subject:** "🔐 Reset Your QRewards Password"
- **Content:** Secure password reset with token-based authentication
- **Features:** Security warnings, clear instructions, fallback link

## Security Considerations

### Password Reset Security
- Reset tokens are cryptographically secure (32-byte random hex)
- Tokens should be stored in a separate table with expiry timestamps (production recommendation)
- Current implementation includes security warnings in emails
- Password validation (minimum 8 characters)

### Email Security
- Uses AWS SES for reliable email delivery
- Professional email templates with security notices
- No sensitive information in email content
- Clear instructions for users who didn't request the action

## Production Recommendations

### For Password Reset Tokens
1. Create a separate `PasswordResetToken` table in the database
2. Store tokens with expiry timestamps
3. Invalidate tokens after use
4. Implement rate limiting for reset requests

### For Email Configuration
1. Verify SES domain for production
2. Set up proper SPF/DKIM records
3. Monitor email delivery rates
4. Implement email templates in a CMS for easy updates

## Environment Variables

Make sure these environment variables are set:
```bash
SES_FROM_EMAIL=your-verified-email@domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Usage Examples

### Testing Approval Email
```javascript
// Test approval email for a specific business
const response = await fetch('/api/admin/test-approval-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    businessId: 'business-id-here',
    testEmail: 'test@example.com' // Optional
  })
});
```

### Testing Password Reset
```javascript
// Test password reset for a user
const response = await fetch('/api/admin/test-password-reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    testEmail: 'test@example.com' // Optional
  })
});
```

## Troubleshooting

### Common Issues

1. **Emails not sending:**
   - Check SES configuration and permissions
   - Verify sender email is verified in SES
   - Check AWS region consistency (us-west-1)

2. **Password reset not working:**
   - Ensure user exists and is active
   - Check email address is correct
   - Verify token generation is working

3. **Approval emails not sending:**
   - Check business has associated users
   - Verify business status is being updated correctly
   - Check SES permissions and configuration

### Debug Steps

1. Check server logs for error messages
2. Verify AWS credentials are properly configured
3. Test SES functionality with simple email first
4. Check database connections and GraphQL queries

## Future Enhancements

1. **Email Templates:** Move to a template management system
2. **Token Management:** Implement proper token storage and expiry
3. **Rate Limiting:** Add rate limiting for password reset requests
4. **Email Preferences:** Allow users to manage email preferences
5. **Multi-language Support:** Add support for multiple languages
6. **Email Analytics:** Track email open rates and click-through rates 