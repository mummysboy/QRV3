# Multiple Businesses Fix

## Problem Description

The business dashboard had a critical issue when users tried to add multiple businesses to their account. The problem occurred because:

1. **Login API only returned the first business** - When a user had multiple businesses, the login API would only return the first business associated with their email
2. **Session management was single-business** - The JWT session token only contained one business ID
3. **Dashboard crashes on login** - When the dashboard tried to load data, it was working with the wrong business or missing data
4. **Business switching didn't work** - Users couldn't properly switch between their businesses

## Root Cause

The issue was in the database relationship design and session management:

- When a user adds another business via the "Add Business" feature, it creates a new `BusinessUser` record linking their email to the new business
- The login API was designed to only handle single business relationships
- The session token only stored one `businessId`
- The dashboard expected a single business but received multiple businesses

## Fixes Implemented

### 1. Updated Login API (`/api/business-login/route.ts`)

**Changes:**
- Modified to find **all users** with the given email instead of just the first one
- Added logic to find a user with a valid password (users added via "Add Business" have empty passwords)
- Fetch **all businesses** for the user instead of just one
- Filter for **approved businesses only**
- Use the first approved business as the **primary business** for the session
- Return **all approved businesses** in the response for business switching

**Key improvements:**
```typescript
// Find all users by email (user might have multiple businesses)
const users = await client.graphql({
  query: `query GetBusinessUser($email: String!) {
    listBusinessUsers(filter: { email: { eq: $email } }) {
      items { ... }
    }
  }`
});

// Find a user with a valid password
const validUser = users.find(user => user.password && user.password.trim() !== '');

// Get all businesses for this user
const businessIds = users.map(user => user.businessId);
const businesses = [];
for (const businessId of businessIds) {
  // Fetch each business individually
}

// Return all approved businesses
return {
  business: primaryBusiness, // Primary business for backward compatibility
  allBusinesses: approvedBusinesses, // All approved businesses
  totalBusinesses: approvedBusinesses.length,
};
```

### 2. Updated Login Page (`/app/business/login/page.tsx`)

**Changes:**
- Store **all businesses** in sessionStorage for business switching
- Store **total business count** for UI logic
- Maintain backward compatibility with existing session data

**Key improvements:**
```typescript
// Store all businesses for business switching functionality
if (data.allBusinesses) {
  sessionStorage.setItem('allBusinesses', JSON.stringify(data.allBusinesses));
}

// Store total business count
if (data.totalBusinesses) {
  sessionStorage.setItem('totalBusinesses', data.totalBusinesses.toString());
}
```

### 3. Updated Dashboard (`/app/business/dashboard/page.tsx`)

**Changes:**
- Load **all businesses** from sessionStorage on initialization
- Improved business switching with **session token updates**
- Better handling of business data refresh
- Prevent unnecessary API calls when businesses are already loaded

**Key improvements:**
```typescript
// Load all businesses from sessionStorage if available
if (allBusinessesData) {
  const allBusinessesObj = JSON.parse(allBusinessesData);
  setAllBusinesses(allBusinessesObj);
}

// Business switching with session update
onChange={async (e) => {
  const selectedBusiness = allBusinesses.find(b => b.id === e.target.value);
  if (selectedBusiness) {
    setBusiness(selectedBusiness);
    sessionStorage.setItem('businessData', JSON.stringify(selectedBusiness));
    
    // Update session cookie with new business ID
    const response = await fetch('/api/business/set-session', {
      method: 'POST',
      body: JSON.stringify({ 
        sessionToken,
        businessId: selectedBusiness.id 
      }),
    });
  }
}}
```

### 4. Updated Set-Session API (`/api/business/set-session/route.ts`)

**Changes:**
- Added support for **business switching** by creating new session tokens
- Accept optional `businessId` parameter for switching
- Create new JWT token with updated business ID when switching

**Key improvements:**
```typescript
// If businessId is provided, create a new session token for that business
if (businessId) {
  const decoded = jwt.verify(sessionToken, JWT_SECRET) as JWTPayload;
  const newPayload = {
    sub: decoded.sub,
    email: decoded.email,
    businessId: businessId, // New business ID
    role: decoded.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  };
  finalSessionToken = jwt.sign(newPayload, JWT_SECRET);
}
```

### 5. Improved Business Management

**Changes:**
- Better handling of business list refresh after adding new businesses
- Clear sessionStorage and fetch fresh data when needed
- Prevent duplicate API calls

## Testing

Created a test script (`test-multiple-businesses.js`) to verify:
- Login with multiple businesses
- Business switching functionality
- Adding new businesses
- Session management across business switches

## Backward Compatibility

All changes maintain backward compatibility:
- Existing single-business users continue to work normally
- Session tokens still work for single businesses
- Dashboard UI remains the same for single-business users
- Business switcher only appears when user has multiple businesses

## Security Considerations

- Only **approved businesses** are returned in login response
- Users can only switch to businesses they own
- Session tokens are properly validated and updated
- Empty passwords from "Add Business" are handled correctly

## Performance Improvements

- Reduced unnecessary API calls by caching businesses in sessionStorage
- Better handling of business data loading
- Improved session management efficiency

## Future Enhancements

1. **Business-specific permissions** - Different roles per business
2. **Business grouping** - Organize businesses by categories
3. **Bulk operations** - Manage multiple businesses simultaneously
4. **Business analytics** - Cross-business reporting
5. **Business templates** - Quick setup for similar businesses 