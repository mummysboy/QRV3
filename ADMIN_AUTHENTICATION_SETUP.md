# Secure Admin Authentication Setup

## Overview

The admin authentication system has been completely redesigned for maximum security. It now uses:

- ✅ **Secure password hashing** with bcrypt (12 rounds)
- ✅ **JWT tokens** for session management
- ✅ **Database-stored admin users** instead of hardcoded credentials
- ✅ **Password change functionality** for admins
- ✅ **Server-side session validation**
- ✅ **Secure HTTP-only cookies**
- ✅ **Session expiration** (24 hours)
- ✅ **Protected API endpoints**

## Security Features

### Password Security
- **bcrypt hashing** with 12 salt rounds
- **Minimum 8 characters** required
- **Password change functionality** with current password verification
- **No plain text passwords** stored anywhere

### Session Management
- **JWT tokens** with 24-hour expiration
- **HTTP-only cookies** (cannot be accessed by JavaScript)
- **Secure cookies** (HTTPS only in production)
- **Automatic session cleanup**

### Database Security
- **AdminUser model** in Amplify schema
- **Encrypted password storage**
- **User status tracking** (active/inactive)
- **Last login tracking**

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# JWT Secret (REQUIRED - change this in production!)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

### 3. Verify Setup
After running the script, you should see:
```
✅ Admin user created successfully!

📋 Admin Details:
   Username: your-username
   Email: your-email@example.com
   Name: Your Name

🔐 You can now log in to the admin dashboard at:
https://your-app.vercel.app/admin/login
```

## How It Works

### 1. Login Process
- User submits credentials to `/api/admin/login`
- Server validates credentials against database
- If valid, creates JWT token and sets HTTP-only cookie
- Redirects to admin dashboard

### 2. Session Validation
- Admin dashboard validates session with `/api/admin/validate-session`
- All admin API endpoints check for valid JWT token
- Sessions expire after 24 hours

### 3. Password Change
- Admin clicks "Change Password" in dashboard
- Must provide current password for verification
- New password is hashed and stored securely
- New JWT token is issued

### 4. Logout Process
- User clicks logout
- Calls `/api/admin/logout` to clear JWT cookie
- Redirects to login page

## API Endpoints

### POST /api/admin/login
- Validates admin credentials against database
- Creates JWT token and sets secure cookie
- Returns user info

### GET /api/admin/validate-session
- Validates JWT token
- Returns user info if valid

### POST /api/admin/logout
- Clears JWT cookie
- Returns success message

### POST /api/admin/change-password
- Validates current password
- Updates password with new hash
- Issues new JWT token
- Returns success message

### POST /api/admin/create-admin
- Creates new admin user (setup only)
- Validates all required fields
- Hashes password securely
- Returns admin info

## Database Schema

The `AdminUser` model includes:

```typescript
AdminUser: {
  id: string (required)
  username: string (required)
  email: string (required)
  password: string (required, hashed)
  firstName: string (required)
  lastName: string (required)
  role: string (required)
  status: string (required)
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}
```

## Security Best Practices

### Production Deployment
1. **Change JWT_SECRET** to a strong, unique value
2. **Enable HTTPS** for secure cookies
3. **Use strong passwords** (12+ characters recommended)
4. **Regular password changes** (every 90 days)
5. **Monitor login attempts** and failed authentications

### Password Requirements
- Minimum 8 characters
- Recommended: uppercase, lowercase, numbers, symbols
- No common passwords or dictionary words
- Unique from other accounts

### Session Security
- Sessions expire after 24 hours
- Logout clears all session data
- JWT tokens are signed and tamper-proof
- HTTP-only cookies prevent XSS attacks

## Troubleshooting

### Can't log in after deployment
- Check that JWT_SECRET is set in environment variables
- Verify the AdminUser model is deployed to your database
- Run the setup script to create admin user
- Check browser console for errors

### Password change not working
- Ensure current password is correct
- Check that new password meets requirements (8+ characters)
- Verify password confirmation matches
- Check network tab for API errors

### Session expires too quickly
- Default session time is 24 hours
- Can be adjusted in JWT token creation
- Check system time is correct
- Verify cookie settings

### API endpoints return 401
- JWT token may be missing or expired
- Try logging in again
- Check if cookies are enabled in browser
- Verify HTTPS is enabled in production

## Migration from Old System

If you're upgrading from the old hardcoded system:

1. **Deploy the new schema** with AdminUser model
2. **Run the setup script** to create your admin user
3. **Test login** with new credentials
4. **Remove old environment variables** (ADMIN_USERNAME, ADMIN_PASSWORD)
5. **Update documentation** for your team

## Support

For issues with the admin authentication system:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test the setup script with your deployment URL
4. Check that the database schema is up to date
5. Review the troubleshooting section above 