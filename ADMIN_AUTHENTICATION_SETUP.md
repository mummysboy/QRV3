# Phone-Only Admin Authentication Setup

## Overview

The admin authentication system has been redesigned for **phone-only login** with SMS verification. It now uses:

- ✅ **Phone-only authentication** - no username/password required
- ✅ **SMS verification** via AWS SNS
- ✅ **6-digit login codes** with 5-minute expiration
- ✅ **Rate limiting** with 60-second resend cooldown
- ✅ **Secure token storage** in HTTP-only cookies
- ✅ **Phone number validation** and formatting
- ✅ **JWT tokens** for session management
- ✅ **Database-stored admin users** with phone numbers
- ✅ **Server-side session validation**
- ✅ **Secure HTTP-only cookies**
- ✅ **Session expiration** (24 hours)
- ✅ **Protected API endpoints**

## Security Features

### Phone-Only Authentication
- **SMS verification** via AWS SNS
- **6-digit codes** with 5-minute expiration
- **Rate limiting** with 60-second resend cooldown
- **Secure token storage** in HTTP-only cookies
- **Phone number validation** and formatting
- **No passwords required** - phone is the credential

### Session Management
- **JWT tokens** with 24-hour expiration
- **HTTP-only cookies** (cannot be accessed by JavaScript)
- **Secure cookies** (HTTPS only in production)
- **Automatic session cleanup**

### Database Security
- **AdminUser model** in Amplify schema with phone numbers
- **Phone number storage** for authentication
- **User status tracking** (active/inactive)
- **Last login tracking**

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# JWT Secret (REQUIRED - change this in production!)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AWS Configuration (for SMS)
AWS_REGION=us-west-1
```

## Initial Setup

### 1. Deploy the Application
First, deploy your application to get the live URL.

### 2. Run the Admin Setup Script
Use the provided setup script to create your first admin user:

```bash
node setup-admin.js
```

The script will prompt you for:
- Application URL
- Admin username
- Admin email
- Admin first name
- Admin last name
- Admin password (min 8 characters)
- **Phone number** (for authentication)

### 3. Test Phone-Only Login
Test the phone-only login system:

```bash
node test-phone-login.js
```

This will test:
- Sending login codes to your phone
- Verifying codes and completing login
- Full phone-only authentication flow

### 4. Verify Setup
After running the scripts, you should see:
```
✅ Admin user created successfully!
✅ Login code sent successfully!
✅ Phone-only login successful!
```

## How Phone-Only Login Works

### 1. Login Process
1. **Enter Phone Number**: User enters their phone number
2. **Send Code**: System sends 6-digit code via SMS
3. **Verify Code**: User enters the code to complete authentication
4. **Access Granted**: Redirected to admin dashboard

### 2. Security Flow
- **Step 1**: User enters phone number
- **Step 2**: System validates phone format and sends SMS
- **Step 3**: User receives 6-digit code on their phone
- **Step 4**: User enters code to complete verification
- **Step 5**: System creates secure session with phone verification

### 3. Session Validation
- Admin dashboard validates session with `/api/admin/validate-session`
- All admin API endpoints check for valid JWT token
- Sessions expire after 24 hours
- Phone verification is included in session token

### 4. Logout Process
- User clicks logout
- Calls `/api/admin/logout` to clear JWT cookie
- Redirects to login page

## API Endpoints

### POST /api/admin/send-mfa
- Sends 6-digit login code via SMS
- Validates phone number format
- Creates temporary MFA token (5 minutes)
- Returns success message

### POST /api/admin/verify-mfa
- Validates login code
- Creates authenticated session
- Returns user info and sets cookies

### GET /api/admin/validate-session
- Validates JWT token
- Returns user info if valid

### POST /api/admin/logout
- Clears JWT cookie
- Returns success message

### POST /api/admin/create-admin
- Creates new admin user (setup only)
- Validates all required fields including phone number
- Returns admin info

## Database Schema

The `AdminUser` model includes:

```typescript
AdminUser: {
  id: string (required)
  username: string (required)
  email: string (required)
  password: string (required, hashed)
  phoneNumber: string (optional, for phone-only auth)
  firstName: string (required)
  lastName: string (required)
  role: string (required)
  status: string (required)
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}
```

## Phone Number Configuration

### Your Phone Number Setup
Your phone number **4155724853** is pre-configured in the login form. To change it:

1. **Edit the form**: Update `src/components/AdminPhoneLoginForm.tsx`
2. **Change default value**: Modify the `phoneNumber` state
3. **Or make it editable**: Allow users to input their own number

### AWS SNS Configuration
The system uses AWS SNS for SMS delivery:

1. **Region**: Configured for `us-west-1`
2. **Credentials**: Uses default AWS credential provider chain
3. **Permissions**: Requires SNS send permissions
4. **Format**: Automatically formats phone numbers to E.164

### SMS Message Format
```
Your QRewards admin login code is: 123456. This code expires in 5 minutes.
```

## Security Best Practices

### Production Deployment
1. **Change JWT_SECRET** to a strong, unique value
2. **Enable HTTPS** for secure cookies
3. **Monitor SMS delivery** and failed login attempts
4. **Restrict phone numbers** to authorized admin numbers
5. **Monitor login attempts** and failed authentications

### Phone-Only Security
- **Code expiration**: 5 minutes maximum
- **Rate limiting**: 60-second resend cooldown
- **Secure storage**: Codes stored in encrypted JWT tokens
- **Phone validation**: Automatic E.164 formatting
- **Session tracking**: Phone verification included in session
- **Authorized numbers**: Only specific phone numbers can access admin

### Session Security
- Sessions expire after 24 hours
- Logout clears all session data
- JWT tokens are signed and tamper-proof
- HTTP-only cookies prevent XSS attacks
- Phone verification required for each login

## Testing

### Test Phone-Only Login
```bash
node test-phone-login.js
```

### Test Admin Setup
```bash
node setup-admin.js
```

### Manual Testing
1. Navigate to `/admin/login`
2. Enter your phone number (pre-filled: 4155724853)
3. Click "Send Login Code"
4. Check your phone for the SMS
5. Enter the 6-digit code
6. Verify successful login

## Troubleshooting

### Can't receive login codes
- Check AWS SNS configuration
- Verify phone number format (E.164)
- Check AWS credentials and permissions
- Monitor AWS CloudWatch logs
- Test with different phone number

### Login verification fails
- Ensure code is entered within 5 minutes
- Check for typos in the 6-digit code
- Check browser console for errors
- Try requesting a new code

### Can't log in after deployment
- Check that JWT_SECRET is set in environment variables
- Verify the AdminUser model is deployed to your database
- Run the setup script to create admin user
- Check browser console for errors
- Verify AWS SNS is configured correctly

### Session expires too quickly
- Default session time is 24 hours
- Can be adjusted in JWT token creation
- Check system time is correct
- Verify cookie settings

### API endpoints return 401
- JWT token may be missing or expired
- Try logging in again with phone verification
- Check if cookies are enabled in browser
- Verify HTTPS is enabled in production

## Migration from Old System

If you're upgrading from the old hardcoded system:

1. **Deploy the new schema** with AdminUser model
2. **Run the setup script** to create your admin user
3. **Test phone-only login** with your phone number
4. **Test login** with new phone-only flow
5. **Remove old environment variables** (ADMIN_USERNAME, ADMIN_PASSWORD)
6. **Update documentation** for your team

## Support

For issues with the phone-only authentication system:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test the setup script with your deployment URL
4. Check that the database schema is up to date
5. Verify AWS SNS configuration
6. Test phone-only login with the provided test script
7. Review the troubleshooting section above 