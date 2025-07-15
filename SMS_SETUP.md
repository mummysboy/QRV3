# SMS Setup Documentation

## Overview
Your QRewards project now has full SMS capabilities enabled since moving out of the AWS SNS sandbox. This allows you to send SMS messages to any phone number without pre-verification.

## Configuration

### Regions
- **Primary Region**: `us-west-1` (matches your project configuration)
- **SNS Client**: Updated to use `us-west-1` for consistency

### Files Updated
1. `src/app/api/send-sms/route.ts` - Main SMS sending API
2. `src/app/api/test-sms/route.ts` - Test endpoint for SMS functionality
3. `sns-permissions-policy.json` - Full SNS permissions policy
4. `sns-send-only-policy.json` - Restricted SMS-only policy

## IAM Permissions Required

### For Production (Recommended)
Use the `sns-send-only-policy.json` which only allows SMS publishing:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "sns:Protocol": "sms"
        }
      }
    }
  ]
}
```

### For Development/Testing
Use the `sns-permissions-policy.json` for full SNS access.

## Testing SMS Functionality

### Test Endpoint
Use the test endpoint to verify SMS is working:
```bash
POST /api/test-sms
{
  "phoneNumber": "5551234567"
}
```

### Production Endpoint
The main SMS endpoint for sending rewards:
```bash
POST /api/send-sms
{
  "to": "5551234567",
  "url": "https://www.qrewards.net/reward/abc123",
  "header": "Starbucks Gift"
}
```

## Phone Number Formatting

The system automatically:
1. Removes all non-digit characters
2. Adds +1 country code if not present
3. Validates the final format

Examples:
- `(555) 123-4567` → `+15551234567`
- `5551234567` → `+15551234567`
- `+15551234567` → `+15551234567`

## Error Handling

The system now provides specific error messages for common issues:
- Invalid phone number format
- Phone number opted out of SMS
- Rate limiting exceeded
- General SNS errors

## Cost Considerations

- SMS pricing varies by country/region
- US numbers: ~$0.00645 per SMS
- International numbers: Higher rates apply
- Monitor usage in AWS SNS console

## Compliance

- Users can reply "STOP" to opt out
- Include opt-out instructions in your terms
- Respect opt-out requests immediately
- Monitor delivery reports for compliance

## Next Steps

1. Apply the appropriate IAM policy to your AWS roles
2. Test with the `/api/test-sms` endpoint
3. Monitor SMS delivery in AWS SNS console
4. Set up CloudWatch alarms for SMS failures
5. Consider implementing delivery receipts 