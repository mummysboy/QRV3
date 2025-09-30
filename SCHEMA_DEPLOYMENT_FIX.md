# GraphQL Schema Deployment Fix

## Problem
The reward creation is failing with GraphQL validation errors:
```
Validation error: Field 'created_at' in type 'Card' is undefined
Validation error: Field 'duration_hours' in type 'Card' is undefined
```

## Root Cause
The local schema in `amplify/data/resource.ts` has `created_at` and `duration_hours` fields defined, but these changes **have not been deployed** to the AWS Amplify hosted environment.

Your **local code** expects these fields:
```typescript
Card: a.model({
  // ... other fields
  created_at: a.string(),    // ← Local schema has this
  duration_hours: a.float(), // ← Local schema has this
})
```

But your **deployed GraphQL API** doesn't have them yet.

## Solution: Deploy Schema Changes

### Option 1: Amplify Sandbox (Development)
If you're testing locally:
```bash
cd "/Users/isaachirsch/QRV3 9.34.21 PM"
npx ampx sandbox
```

This will:
1. Deploy your schema changes to a sandbox environment
2. Update the GraphQL API with the new fields
3. Allow you to test locally with the updated schema

### Option 2: Deploy to Production
If you're ready to deploy to your live hosted environment:

```bash
cd "/Users/isaachirsch/QRV3 9.34.21 PM"

# Push schema changes to production
npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
```

Or use the Amplify Console:
1. Go to AWS Amplify Console
2. Select your app
3. Go to the "Backend environments" tab
4. Click "Deploy" to push the latest schema changes

### Option 3: Git Push (if using Amplify Hosting)
If your Amplify app is connected to GitHub:

```bash
git add amplify/data/resource.ts
git commit -m "feat: add created_at and duration_hours fields to Card schema"
git push origin main
```

Amplify will automatically deploy the schema changes.

## Verification

After deployment, verify the fix:

1. **Check Amplify Console Logs:**
   - Go to AWS Amplify Console
   - Look for "Backend" deployment logs
   - Ensure schema deployment succeeded

2. **Test Reward Creation:**
   ```bash
   # Try creating a reward in your app
   # You should no longer see GraphQL validation errors
   ```

3. **Check Console Logs:**
   ```bash
   # Should show successful reward creation:
   ✅ Creating card with input: { created_at: '...', duration_hours: ... }
   ✅ Card created successfully
   ```

## Why This Happened

The `created_at` and `duration_hours` fields were added to support relative duration-based rewards (instead of fixed expiration dates). The code was updated to use these fields, but the schema wasn't deployed yet.

**Timeline of changes:**
1. ✅ Code updated to use `created_at` and `duration_hours`
2. ✅ Schema updated locally in `resource.ts`
3. ❌ Schema **not yet deployed** to AWS

## Files Affected
- `amplify/data/resource.ts` - Schema definition (already updated ✅)
- AWS AppSync GraphQL API - Needs deployment ❌

## Next Steps

1. **Deploy the schema** using one of the methods above
2. **Test reward creation** to ensure errors are resolved
3. **Monitor logs** to verify successful deployment

## Rollback Plan (if needed)

If deployment causes issues, you can temporarily rollback by removing the fields from queries:

```typescript
// In src/app/api/business/rewards/route.ts
// Remove created_at and duration_hours from the query:
query: `
  query GetBusinessCards($businessId: String!) {
    listCards(filter: {
      businessId: { eq: $businessId }
    }) {
      items {
        cardid
        quantity
        // created_at      ← Comment out temporarily
        // duration_hours  ← Comment out temporarily
        expires
      }
    }
  }
`
```

But **this is not recommended** - better to deploy the schema properly.

## Expected Deployment Time
- Sandbox deployment: ~2-3 minutes
- Production deployment: ~5-10 minutes
- Full build + deployment: ~10-15 minutes

## Confirmation

After deployment succeeds, you should see in the logs:
```
✅ Schema deployed successfully
✅ GraphQL API updated
✅ Backend environment ready
```

Then test reward creation - it should work without errors! 🎉

