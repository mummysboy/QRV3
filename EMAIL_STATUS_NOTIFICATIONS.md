# Email Status Notifications System

## Overview

This document describes the comprehensive email notification system that has been implemented to automatically notify users of account status changes in the QRewards platform.

## Features Implemented

### 1. Comprehensive Status Change Notifications

The system now sends automatic email notifications for all major status changes:

- **Business Account Approval** - When a business is approved by admin
- **Business Account Rejection** - When a business application is rejected
- **Application Received** - When a business signs up and is pending approval
- **Account Suspension** - When a business account is suspended
- **Profile Update Approval** - When business profile updates are approved
- **Profile Update Rejection** - When business profile updates are rejected
- **Generic Status Changes** - For any other status changes

### 2. Email Templates

Each status change has a professionally designed email template with:

- **Branded Design** - Consistent QRewards branding and styling
- **Clear Messaging** - Status-specific content and next steps
- **Contact Information** - Links to contact form for support
- **Action Buttons** - Relevant CTAs (login, dashboard, contact support)
- **Responsive Design** - Works on all email clients

### 3. Contact Form Integration

All emails include links to the contact form (`https://www.qrewards.net/contact`) for users who have questions about their status changes.

## Implementation Details

### Files Modified/Created

**New Files:**
- `src/lib/email-notifications.ts` - Central email notification system
- `src/app/api/admin/test-status-email/route.ts` - Test endpoint for email verification

**Modified Files:**
- `src/app/api/admin/update-signup-status/route.ts` - Updated to use new email system
- `src/app/api/admin/reject-business/route.ts` - Added rejection email notifications
- `src/app/api/admin/approve-update/route.ts` - Added update approval/rejection emails
- `src/app/api/business-signup/route.ts` - Added signup confirmation email

### Email Notification Flow

1. **Status Change Occurs** - Admin or system changes account status
2. **User Lookup** - System finds the primary business user
3. **Email Generation** - Appropriate template is selected based on status
4. **Email Delivery** - Email is sent via AWS SES
5. **Error Handling** - Email failures don't break the main operation

### Supported Status Types

| Status | Email Subject | Description |
|--------|---------------|-------------|
| `approved` | 🎉 Your QRewards Business Account Has Been Approved! | Business account approved |
| `rejected` | ❌ Your QRewards Business Account Application Update | Business application rejected |
| `pending_approval` | ⏳ Your QRewards Business Account Application Received | Application received and pending |
| `suspended` | ⚠️ Your QRewards Business Account Has Been Suspended | Account suspended |
| `update_approved` | ✅ Your Business Profile Update Has Been Approved | Profile update approved |
| `update_rejected` | ❌ Your Business Profile Update Has Been Rejected | Profile update rejected |
| `*` | 📧 Your QRewards Account Status Update | Generic status change |

## Testing

### Test Endpoint

Use the test endpoint to verify email functionality:

```bash
POST /api/admin/test-status-email
{
  "email": "user@example.com",
  "status": "approved",
  "businessName": "Test Business",
  "userName": "Test User",
  "reason": "Optional rejection reason",
  "testEmail": "your-test-email@example.com"  // Optional override
}
```

### Test All Status Types

You can test all supported status types:

```bash
# Test approval email
curl -X POST /api/admin/test-status-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","status":"approved","businessName":"Test Cafe"}'

# Test rejection email
curl -X POST /api/admin/test-status-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","status":"rejected","businessName":"Test Cafe","reason":"Incomplete information"}'

# Test pending email
curl -X POST /api/admin/test-status-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","status":"pending_approval","businessName":"Test Cafe"}'
```

## Email Templates

### Approval Email Features
- Congratulations message
- Business name and approval confirmation
- Next steps for getting started
- Login information and dashboard link
- Contact support information

### Rejection Email Features
- Professional rejection message
- Optional feedback/reason section
- Next steps for resubmission
- Contact support for questions

### Pending Email Features
- Application received confirmation
- Review timeline (2-3 business days)
- What happens next explanation
- Contact information for questions

### Suspension Email Features
- Suspension notice
- Optional reason for suspension
- What suspension means for the business
- Contact support for resolution

### Update Approval/Rejection Features
- Profile update status
- What was updated (for approvals)
- Feedback (for rejections)
- Next steps for further changes

## Error Handling

The email notification system includes robust error handling:

- **Non-blocking** - Email failures don't break main operations
- **Logging** - All email attempts are logged for debugging
- **Graceful degradation** - System continues if email service is unavailable
- **User fallback** - Contact form links provide alternative support

## Configuration

### Environment Variables

The system uses these environment variables:

```env
SES_FROM_EMAIL=QRewards@qrewards.net
NEXT_PUBLIC_BASE_URL=https://www.qrewards.net
```

### AWS SES Configuration

- **Region**: us-west-1
- **From Email**: QRewards@qrewards.net
- **Credentials**: Uses default AWS credential provider chain

## Contact Form Integration

All emails include links to the contact form at `https://www.qrewards.net/contact` where users can:

- Ask questions about their status
- Request clarification on decisions
- Get help with next steps
- Report issues or errors

## Future Enhancements

Potential improvements for the email notification system:

1. **Email Preferences** - Allow users to opt out of certain notifications
2. **SMS Notifications** - Add SMS for critical status changes
3. **Custom Templates** - Allow businesses to customize email templates
4. **Multi-language Support** - Support for multiple languages
5. **Analytics** - Track email open rates and engagement
6. **A/B Testing** - Test different email templates and content

## Maintenance

### Monitoring

- Check CloudWatch logs for email delivery status
- Monitor SES bounce and complaint rates
- Review email delivery metrics regularly

### Updates

- Email templates can be updated in `src/lib/email-notifications.ts`
- Test all templates after making changes
- Verify contact form links are working

## Support

For questions about the email notification system:

1. Check the logs for delivery status
2. Use the test endpoint to verify functionality
3. Review AWS SES console for delivery metrics
4. Contact the development team for technical issues 