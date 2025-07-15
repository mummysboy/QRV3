# AWS SNS Spending Limit Fix Guide

## 🚨 Issue: SMS Not Sending After Sandbox Exit

When moving out of the AWS SNS sandbox, AWS requires you to **raise your spending limit** before you can send SMS messages to unverified numbers.

## 🔧 Step-by-Step Fix

### 1. Access AWS SNS Console
1. Go to [AWS SNS Console](https://console.aws.amazon.com/sns/)
2. Make sure you're in the **us-west-1** region (top right corner)
3. Click on **"Text messaging (SMS)"** in the left sidebar

### 2. Check Current Spending Limit
1. Look for **"SMS spending limit"** section
2. Note your current limit (likely $1.00 or similar low amount)
3. This limit applies to **all SMS costs** (not just per message)

### 3. Request Spending Limit Increase
1. Click **"Edit"** or **"Request increase"** button
2. You'll be redirected to the **AWS Service Quotas console**
3. Look for **"SNS SMS spending limit"**
4. Click **"Request quota increase"**

### 4. Fill Out the Request Form
- **New quota value**: Enter your desired monthly limit (e.g., $50, $100, $500)
- **Use case**: Explain your SMS usage (e.g., "Sending reward notifications to customers")
- **Business justification**: Describe your application and expected volume

### 5. Submit and Wait
- AWS typically responds within 24-48 hours
- You'll receive an email when approved
- **You cannot send SMS until this is approved**

## 📊 Cost Calculation

### Current SMS Pricing (us-west-1)
- **US/Canada**: $0.00645 per SMS
- **International**: Varies by country ($0.02 - $0.10+)

### Recommended Spending Limits
- **Development/Testing**: $10-25/month
- **Small Production**: $50-100/month  
- **Medium Production**: $100-500/month
- **Large Production**: $500+/month

## 🧪 Testing After Approval

### 1. Use the Test Endpoint
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "7075598159"}'
```

### 2. Check Logs
Look for these log messages:
```
📱 SMS API called with: { to: "7075598159", url: "...", header: "..." }
📱 Phone number processing: { original: "...", cleaned: "...", withCountryCode: "+17075598159" }
📱 SMS message: "🎁 Your reward is ready! View it here: ..."
📱 Sending SMS via SNS...
📱 SNS Command: { ... }
📱 SNS response: { MessageId: "...", ... }
```

### 3. Monitor AWS SNS Console
- Check **"SMS delivery status"** for delivery reports
- Monitor **"SMS spending"** for cost tracking
- Review **"SMS preferences"** for settings

## 🚨 Common Error Messages

### "SpendingLimitExceeded"
- **Solution**: Increase spending limit in AWS SNS console

### "InvalidParameter"
- **Solution**: Check phone number format

### "OptOut"
- **Solution**: Phone number has opted out of SMS

### "Throttled"
- **Solution**: Reduce SMS sending rate

## 🔍 Debugging Steps

### 1. Check AWS Credentials
```bash
# Test AWS configuration
curl http://localhost:3000/api/test-aws
```

### 2. Verify Region Consistency
- Ensure all services use `us-west-1`
- Check SNS console region matches your app

### 3. Test with AWS CLI
```bash
aws sns publish \
  --phone-number "+17075598159" \
  --message "Test SMS from AWS CLI" \
  --region us-west-1
```

## 📋 Pre-Approval Checklist

Before requesting spending limit increase:

- [ ] AWS account is in good standing
- [ ] Phone number format is correct (+1XXXXXXXXXX)
- [ ] SNS region matches your application (us-west-1)
- [ ] IAM permissions are properly configured
- [ ] Application is ready for production SMS

## 🎯 Quick Fix Summary

1. **Go to AWS SNS Console** → Text messaging (SMS)
2. **Request spending limit increase** (minimum $10-25)
3. **Wait for approval** (24-48 hours)
4. **Test with `/api/test-sms`** endpoint
5. **Monitor costs** in SNS console

## 📞 Support

If you continue having issues:
- Check AWS SNS documentation
- Review CloudWatch logs for detailed error messages
- Contact AWS support if spending limit request is denied 