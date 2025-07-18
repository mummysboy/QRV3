# Admin Authentication Setup

## Overview

The admin authentication system has been updated to use secure server-side session management instead of client-side sessionStorage.

## Features

- ✅ Server-side session validation
- ✅ Secure HTTP-only cookies
- ✅ Session expiration (24 hours)
- ✅ Protected API endpoints
- ✅ Proper logout functionality

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How It Works

### 1. Login Process
- User submits credentials to `/api/admin/login`
- Server validates credentials against environment variables
- If valid, creates a session token and sets HTTP-only cookie
- Redirects to admin dashboard

### 2. Session Validation
- Admin dashboard validates session with `/api/admin/validate-session`
- All admin API endpoints check for valid session cookie
- Sessions expire after 24 hours

### 3. Logout Process
- User clicks logout
- Calls `/api/admin/logout` to clear session cookie
- Redirects to login page

## API Endpoints

### POST /api/admin/login
- Validates admin credentials
- Creates session and sets cookie
- Returns user info

### GET /api/admin/validate-session
- Validates existing session
- Returns user info if valid

### POST /api/admin/logout
- Clears session cookie
- Returns success message

## Security Features

- **HTTP-only cookies**: Cannot be accessed by JavaScript
- **Secure cookies**: Only sent over HTTPS in production
- **Session expiration**: Automatic cleanup after 24 hours
- **Server-side validation**: All admin endpoints require valid session

## Testing

Run the test script to verify authentication:

```bash
node test-admin-auth.js
```

## Deployment Notes

1. Set environment variables in your hosting platform
2. Ensure HTTPS is enabled for secure cookies
3. Update `NEXT_PUBLIC_APP_URL` to your production domain
4. Consider using a more secure password in production

## Troubleshooting

### Can't log in when hosted
- Check environment variables are set correctly
- Verify HTTPS is enabled for secure cookies
- Check browser console for errors

### Session expires too quickly
- Default session time is 24 hours
- Can be adjusted in `/api/admin/login/route.ts`

### API endpoints return 401
- Session cookie may be missing or expired
- Try logging in again
- Check if cookies are enabled in browser 