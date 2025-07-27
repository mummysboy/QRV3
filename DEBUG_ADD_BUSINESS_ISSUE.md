# Debugging Add Business Issue

## Problem
When trying to add a new business from the business dashboard, users get the error:
```
Error: User information not found
```

## Root Cause Analysis

The issue occurs because the user state is not properly available when the add business form is submitted. This can happen due to:

1. **Timing issues** - User state not loaded when form is opened
2. **SessionStorage issues** - User data not properly stored/retrieved
3. **State management issues** - User state not properly set in React component
4. **Session API issues** - Session API not returning complete user data

## Debugging Steps

### 1. Use the Test Buttons

I've added two test buttons to the dashboard:

#### Test User Data Button
Click this button to see:
- Current user state in React
- SessionStorage user data
- Parsed user object

#### Test Session API Button
Click this button to see:
- Session API response
- User data returned by session API
- Complete user information including firstName and lastName

### 2. Check User Data in Browser Console

Run this in the browser console on the dashboard page:

```javascript
// Test script to check user data in sessionStorage
console.log('🔍 Testing user data in sessionStorage...');

const userData = sessionStorage.getItem('businessUser');
const businessData = sessionStorage.getItem('businessData');
const allBusinessesData = sessionStorage.getItem('allBusinesses');

console.log('📋 User data:', userData);
console.log('📋 Business data:', businessData);
console.log('📋 All businesses data:', allBusinessesData);

if (userData) {
  try {
    const userObj = JSON.parse(userData);
    console.log('✅ Parsed user object:', userObj);
    console.log('📧 User email:', userObj.email);
    console.log('👤 User firstName:', userObj.firstName);
    console.log('👤 User lastName:', userObj.lastName);
    console.log('🆔 User ID:', userObj.id);
    console.log('🎭 User role:', userObj.role);
    console.log('📊 User status:', userObj.status);
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
  }
} else {
  console.log('❌ No user data found in sessionStorage');
}
```

### 3. Check Network Tab

When submitting the add business form, check the Network tab in browser dev tools:
- Look for the request to `/api/business/add-business`
- Check the request headers for `x-user-email`, `x-user-firstname`, `x-user-lastname`
- Check the response for any error messages

### 4. Check Server Logs

The add-business API now has debugging logs. Check the server console for:
```
🔍 Add-Business API - Received headers: { ... }
❌ Add-Business API - Missing user information: { ... }
```

## Fixes Implemented

### 1. Enhanced User Data Validation with Multiple Fallbacks

Added a comprehensive fallback mechanism that tries multiple sources for user data:

```typescript
// 1. Try React state first
let userEmail = user?.email;
let userFirstName = user?.firstName;
let userLastName = user?.lastName;

// 2. Fallback to sessionStorage
if (!userEmail || !userFirstName || !userLastName) {
  const userData = sessionStorage.getItem('businessUser');
  if (userData) {
    const userObj = JSON.parse(userData);
    userEmail = userObj.email;
    userFirstName = userObj.firstName;
    userLastName = userObj.lastName;
  }
}

// 3. Fallback to session API
if (!userEmail || !userFirstName || !userLastName) {
  const sessionResponse = await fetch('/api/business/check-session');
  const sessionData = await sessionResponse.json();
  
  if (sessionData.hasSession && sessionData.user) {
    userEmail = sessionData.user.email;
    userFirstName = sessionData.user.firstName || 'User';
    userLastName = sessionData.user.lastName || 'Name';
    
    // Update sessionStorage with the user data
    sessionStorage.setItem('businessUser', JSON.stringify(sessionData.user));
  }
}

// 4. Final fallback to business data
if (!userEmail || !userFirstName || !userLastName) {
  const businessData = sessionStorage.getItem('businessData');
  if (businessData) {
    const businessObj = JSON.parse(businessData);
    userEmail = businessObj.email;
    userFirstName = businessObj.name?.split(' ')[0] || 'User';
    userLastName = businessObj.name?.split(' ').slice(1).join(' ') || 'Name';
  }
}
```

### 2. Updated Session API

Enhanced the check-session API to return complete user data including firstName and lastName:

```typescript
// Fetch user data to get firstName and lastName
const userResult = await client.graphql({
  query: `
    query GetBusinessUser($id: String!) {
      getBusinessUser(id: $id) {
        id
        email
        firstName
        lastName
        role
        status
        businessId
      }
    }
  `,
  variables: { id: decoded.sub },
});

return NextResponse.json({ 
  hasSession: true, 
  user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    businessId: user.businessId,
    role: user.role,
    status: user.status
  },
  business: business,
  message: "Valid session found" 
});
```

### 3. Comprehensive Debugging

Added extensive logging to track the fallback process:

```typescript
console.log('🔍 Add Business - Initial user state:', { user, userEmail, userFirstName, userLastName });
console.log('⚠️ User state not available, trying sessionStorage...');
console.log('⚠️ SessionStorage also empty, trying session API...');
console.log('⚠️ Session API also failed, trying business data...');
console.log('❌ User information missing after all fallbacks:', { userEmail, userFirstName, userLastName });
```

### 4. Better Error Messages

Enhanced error messages with detailed debugging information:

```typescript
// Log all available data for debugging
console.log('🔍 Debug - All available data:');
console.log('📋 React user state:', user);
console.log('📋 SessionStorage businessUser:', sessionStorage.getItem('businessUser'));
console.log('📋 SessionStorage businessData:', sessionStorage.getItem('businessData'));
console.log('📋 SessionStorage allBusinesses:', sessionStorage.getItem('allBusinesses'));
```

## Testing the Fix

### 1. Manual Test

1. Log in to the business dashboard
2. Click "Test User Data" button to verify user data is available
3. Click "Test Session API" button to verify session API is working
4. Try to add a new business
5. Check console for debugging information
6. Verify the business is added successfully

### 2. Automated Test

Run the test script:
```bash
node test-multiple-businesses.js
```

## Common Issues and Solutions

### Issue 1: User State Not Loaded
**Symptoms:** User state is null/undefined
**Solution:** The fallback mechanism should handle this by getting data from sessionStorage

### Issue 2: SessionStorage Data Corrupted
**Symptoms:** Error parsing user data from sessionStorage
**Solution:** Clear sessionStorage and log in again

### Issue 3: Session API Not Returning User Data
**Symptoms:** Session API returns empty user object
**Solution:** The session API now fetches complete user data from database

### Issue 4: All Fallbacks Fail
**Symptoms:** No user data available from any source
**Solution:** Check if user is properly logged in and session is valid

### Issue 5: API Headers Not Sent
**Symptoms:** API receives empty headers
**Solution:** Check that the fetch request includes the correct headers

## Prevention

To prevent this issue in the future:

1. **Always validate user data** before making API calls
2. **Use multiple fallback mechanisms** for critical data
3. **Add comprehensive logging** for debugging
4. **Test with multiple business scenarios**
5. **Handle edge cases** in user state management
6. **Ensure session API returns complete user data**

## Monitoring

Monitor these logs for issues:
- Dashboard user data loading
- Add business API requests
- SessionStorage data integrity
- User state management
- Session API responses
- Fallback mechanism success/failure 