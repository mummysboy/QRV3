# Relative Duration Reward Validity Migration

## Overview

This migration refactors the reward validity logic from **absolute timestamp-based expiration** to **relative duration-based expiration**. This resolves timezone-dependent issues where rewards appeared expired or invalid based on the server's timezone rather than the actual duration set by the business.

## Problem Statement

### Before (Absolute Timestamps)
- When a business creates a reward, the system stored `expires` as an absolute ISO timestamp
- Validity checks compared `expires` against current server time
- **Issue**: Rewards appeared expired/invalid depending on server timezone, not actual duration

### After (Relative Duration)
- System now stores `created_at` (reward creation timestamp) and `duration_hours` (validity period)
- Expiration is calculated dynamically: `expiration = created_at + duration_hours`
- **Benefit**: Timezone-independent, consistent expiration regardless of server location

## Schema Changes

### Card Model
Added fields:
- `created_at` (string): ISO timestamp when reward was created
- `duration_hours` (float): Number of hours the reward is valid for
- `expires` (string): **DEPRECATED** - kept for backward compatibility

### ClaimedReward Model
Added fields:
- `created_at` (string): Copied from parent card
- `duration_hours` (float): Copied from parent card
- `expires` (string): **DEPRECATED** - kept for backward compatibility

## Code Changes

### 1. Database Schema (`amplify/data/resource.ts`)
- Added `created_at` and `duration_hours` fields to Card and ClaimedReward models
- Marked `expires` as deprecated but retained for backward compatibility

### 2. Utility Functions (`src/lib/utils.ts`)
- **New**: `calculateExpiration(created_at, duration_hours)` - calculates expiration timestamp
- **New**: `isCardExpiredRelative(created_at, duration_hours, expires)` - checks expiration using relative logic with fallback
- **Modified**: `filterAvailableCards()` - now uses relative duration logic

### 3. Reward Creation (`src/app/api/business/rewards/route.ts`)
- Calculates `duration_hours` from provided `expires` timestamp
- Stores `created_at` (current timestamp) and calculated `duration_hours`
- Still stores `expires` for backward compatibility

### 4. Countdown Timer (`src/components/CardAnimation.tsx`)
- Updated `CountdownTimer` component to accept `created_at` and `duration_hours`
- Calculates expiration dynamically using relative duration
- Falls back to legacy `expires` field if new fields not available

### 5. Frontend Validation (`src/app/claim-reward/[zip-code]/page.tsx`)
- Updated `isCardExpiredFrontend()` to use relative duration logic
- Falls back to legacy `expires` field for old rewards

## Backward Compatibility

The migration is **fully backward compatible**:

1. **Legacy rewards** (with only `expires` field) continue to work
2. **New rewards** use relative duration but also store `expires` for compatibility
3. All validation functions check relative duration first, then fall back to `expires`

## Migration Path

### For Existing Rewards

Existing rewards in the database will continue to work using the `expires` field. Over time, as they expire and are replaced with new rewards, the system will naturally migrate to the new relative duration approach.

### Manual Migration (Optional)

If you want to migrate existing rewards to use relative duration, you can run this script:

```typescript
// Migration script (run once)
async function migrateExistingRewards() {
  const client = generateClient({ authMode: 'apiKey' });
  
  // Fetch all cards
  const result = await client.graphql({
    query: `
      query ListAllCards {
        listCards {
          items {
            cardid
            expires
            created_at
            duration_hours
          }
        }
      }
    `
  });
  
  const cards = result.data.listCards.items;
  
  for (const card of cards) {
    // Skip if already migrated
    if (card.created_at && card.duration_hours) continue;
    
    // Skip if no expiration
    if (!card.expires) continue;
    
    try {
      const expiresDate = new Date(card.expires);
      const now = new Date();
      const durationMs = expiresDate.getTime() - now.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      // Only migrate if duration is positive (not already expired)
      if (durationHours > 0) {
        await client.graphql({
          query: `
            mutation UpdateCard($input: UpdateCardInput!) {
              updateCard(input: $input) {
                cardid
              }
            }
          `,
          variables: {
            input: {
              cardid: card.cardid,
              created_at: now.toISOString(),
              duration_hours: durationHours
            }
          }
        });
        
        console.log(`✅ Migrated card ${card.cardid}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate card ${card.cardid}:`, error);
    }
  }
}
```

## Testing

### Test Cases

1. **New Reward Creation**
   - Create a reward with 24-hour expiration
   - Verify `created_at` and `duration_hours` are stored
   - Verify expiration is calculated correctly

2. **Legacy Reward Compatibility**
   - Fetch an old reward (with only `expires` field)
   - Verify it still displays and validates correctly

3. **Timezone Independence**
   - Create reward on server in timezone A
   - View reward from browser in timezone B
   - Verify expiration countdown is consistent

4. **Countdown Timer**
   - Create reward with 1-hour expiration
   - Verify countdown timer updates correctly
   - Verify timer shows correct time remaining

### Manual Testing

```bash
# 1. Create a test reward
curl -X POST http://localhost:3000/api/business/rewards \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "test-business",
    "subheader": "Test reward",
    "quantity": 10,
    "expires": "2025-10-01T12:00:00.000Z",
    "logokey": "test-logo",
    "addressurl": "https://example.com",
    "addresstext": "123 Main St"
  }'

# 2. Verify created_at and duration_hours are stored
# Check response or query database

# 3. Fetch reward by zip code
curl http://localhost:3000/api/get-card-by-zip?zipcode=94102

# 4. Verify expiration is calculated correctly
# Check browser console for debug logs
```

## Benefits

1. **Timezone Independence**: Rewards expire based on creation time + duration, not server timezone
2. **Consistency**: Same expiration regardless of where/when reward is viewed
3. **Accuracy**: No more premature or delayed expirations due to timezone conversion
4. **Maintainability**: Clearer logic, easier to debug
5. **Backward Compatible**: Existing rewards continue to work

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting the database schema changes (remove `created_at` and `duration_hours`)
2. Reverting code changes to use only `expires` field
3. Existing rewards will continue to work as before

However, the migration is designed to be **risk-free** as it maintains full backward compatibility with the `expires` field.

## Support

For questions or issues, please refer to:
- This migration guide
- Code comments in `src/lib/utils.ts`
- Debug logs (search for "🔍 Relative Duration Check" in console)

