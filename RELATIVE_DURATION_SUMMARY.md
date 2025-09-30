# Relative Duration Reward Validity - Implementation Summary

## ✅ Completed Changes

### 1. Database Schema Updates
**File: `amplify/data/resource.ts`**

Added new fields to both `Card` and `ClaimedReward` models:
- `created_at` (string): ISO timestamp when reward was created
- `duration_hours` (float): Number of hours the reward is valid for
- Kept `expires` field for backward compatibility (marked as deprecated)

### 2. Core Utility Functions
**File: `src/lib/utils.ts`**

**New Functions:**
- `calculateExpiration(created_at, duration_hours)`: Calculates expiration timestamp from creation time and duration
- `isCardExpiredRelative(created_at, duration_hours, expires)`: Checks expiration using relative logic with fallback to legacy field

**Updated Functions:**
- `filterAvailableCards()`: Now uses relative duration logic with proper type support for new fields

### 3. Reward Creation API
**File: `src/app/api/business/rewards/route.ts`**

**Changes:**
- Calculates `duration_hours` from the provided `expires` timestamp
- Stores `created_at` (current timestamp) when reward is created
- Stores calculated `duration_hours` for relative expiration
- Updated `Card` and `ClaimedReward` interfaces to include new fields
- Updated GraphQL queries to fetch new fields

### 4. Claim Reward API
**File: `src/app/api/claim-reward/route.ts`**

**Changes:**
- Copies `created_at` and `duration_hours` from card to claimed reward
- Ensures claimed rewards maintain relative duration information

### 5. Frontend Components
**File: `src/components/CardAnimation.tsx`**

**Changes:**
- Updated `CountdownTimer` component to accept `created_at` and `duration_hours` parameters
- Calculates expiration dynamically using relative duration
- Falls back to legacy `expires` field if new fields not available
- Updated card data mapping to include new fields

### 6. Claim Reward Page
**File: `src/app/claim-reward/[zip-code]/page.tsx`**

**Changes:**
- Updated `isCardExpiredFrontend()` function to use relative duration logic
- Falls back to legacy `expires` validation for old rewards
- Updated `CardData` interface to include new fields
- Updated function calls to pass new parameters

## 🔑 Key Features

### Timezone Independence
- Rewards now expire based on `created_at + duration_hours`, not server timezone
- Consistent behavior regardless of where the server or user is located
- Eliminates timezone conversion issues

### Backward Compatibility
- All existing rewards with only `expires` field continue to work
- New rewards use relative duration but also store `expires` for compatibility
- Validation functions check relative duration first, then fall back to `expires`
- **No breaking changes** - existing functionality preserved

### Dynamic Expiration Calculation
```typescript
// Old approach (timezone-dependent)
const isExpired = new Date(expires) < new Date();

// New approach (timezone-independent)
const expirationTime = creationTime + (duration_hours * 60 * 60 * 1000);
const isExpired = expirationTime < Date.now();
```

## 📊 Testing

### Test Script
Created `test-relative-duration.js` to verify:
- Reward creation with `created_at` and `duration_hours`
- Expiration calculation accuracy
- Timezone independence
- Backward compatibility

### Usage
```bash
node test-relative-duration.js
```

## 📚 Documentation

### Migration Guide
Created `RELATIVE_DURATION_MIGRATION.md` with:
- Complete problem statement
- Detailed schema changes
- Step-by-step migration instructions
- Manual migration script for existing rewards
- Rollback plan
- Testing procedures

## 🔍 Debug Logging

Added comprehensive debug logging:
- `🔍 Relative Duration Check:` - Shows relative duration calculations
- `🔍 Frontend Relative Duration Check:` - Shows frontend validation
- `📅 Reward duration calculation:` - Shows backend duration calculation

Look for these in browser console and server logs to troubleshoot.

## 🚀 Deployment Steps

1. **Deploy Schema Changes**
   ```bash
   # Deploy Amplify backend with new schema
   amplify push
   ```

2. **Deploy Code Changes**
   ```bash
   # Deploy Next.js application
   npm run build
   npm run start
   # or deploy to your hosting platform
   ```

3. **Verify Deployment**
   - Create a new reward
   - Check that `created_at` and `duration_hours` are stored
   - Verify countdown timer displays correctly
   - Test from different timezones

4. **Optional: Migrate Existing Rewards**
   - Run migration script from `RELATIVE_DURATION_MIGRATION.md`
   - Or wait for natural expiration and replacement

## ✨ Benefits

1. **Timezone Independence**: Rewards expire consistently regardless of server timezone
2. **Accuracy**: No more premature or delayed expirations
3. **Consistency**: Same behavior across all environments
4. **Maintainability**: Clearer logic, easier to understand and debug
5. **Backward Compatible**: Zero breaking changes
6. **Future-Proof**: Better foundation for time-based features

## 📝 Files Changed

1. `amplify/data/resource.ts` - Database schema
2. `src/lib/utils.ts` - Utility functions
3. `src/app/api/business/rewards/route.ts` - Reward creation/management
4. `src/app/api/claim-reward/route.ts` - Reward claiming
5. `src/components/CardAnimation.tsx` - Countdown timer
6. `src/app/claim-reward/[zip-code]/page.tsx` - Claim page validation

## 📋 Files Created

1. `RELATIVE_DURATION_MIGRATION.md` - Comprehensive migration guide
2. `RELATIVE_DURATION_SUMMARY.md` - This summary document
3. `test-relative-duration.js` - Automated test script

## 🎯 Success Criteria

- ✅ New rewards store `created_at` and `duration_hours`
- ✅ Expiration calculated from relative duration, not absolute timestamp
- ✅ Existing rewards continue to work via fallback logic
- ✅ Countdown timer shows correct time remaining
- ✅ No timezone-related bugs
- ✅ Debug logs provide visibility into expiration logic

## 🔄 Next Steps

1. Monitor logs for any issues with relative duration calculation
2. Collect feedback on timezone consistency
3. Consider migrating existing rewards (optional)
4. Update business documentation if needed

## 🤝 Support

For questions or issues:
1. Check debug logs in console
2. Review `RELATIVE_DURATION_MIGRATION.md`
3. Run `test-relative-duration.js` to verify behavior
4. Check this summary for implementation details

---

**Implementation Date**: September 30, 2025  
**Status**: ✅ Complete and Ready for Deployment

