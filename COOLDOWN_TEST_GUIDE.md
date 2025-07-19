# Cooldown Test Guide

This guide will help you test the new cooldown functionality that prevents users from generating new rewards when refreshing the claim-reward page within the 15-minute cooldown period.

## What Was Changed

The claim-reward page (`src/app/claim-reward/[zip-code]/page.tsx`) was modified to:

1. **Check cooldown first**: Before fetching a new card, the page now checks if the user is in a cooldown period
2. **Prevent card fetching during cooldown**: If a cooldown is active, no new card is fetched
3. **Show thank you overlay immediately**: The thank you overlay is displayed right away if a cooldown is detected
4. **Add loading state**: A new `isCheckingCooldown` state prevents premature card fetching

## How to Test

### Prerequisites
- Make sure your development server is running: `npm run dev`
- Clear your browser's localStorage to start fresh

### Test Steps

1. **Navigate to a claim-reward page**
   ```
   http://localhost:3000/claim-reward/94105
   ```

2. **Claim a reward**
   - Click the "Claim Reward" button
   - Fill out the form with your email and phone
   - Submit the form
   - You should see the thank you overlay with a 15-minute countdown

3. **Test the refresh behavior**
   - While the thank you overlay is showing, refresh the page (F5 or Ctrl+R)
   - **Expected result**: The thank you overlay should still be displayed with the countdown timer
   - **Expected result**: No new card should be generated

4. **Verify no new card is fetched**
   - Check the browser's developer console
   - You should NOT see any "Fetching card for zip code" or "Card data:" log messages
   - The page should remain in the cooldown state

5. **Test after cooldown expires**
   - Wait for the 15-minute countdown to complete (or manually clear localStorage for testing)
   - Refresh the page
   - **Expected result**: A new card should be generated and displayed

## Manual Testing with Console Script

For easy testing, copy and paste this script into your browser console on the claim-reward page:

```javascript
// Copy and paste this entire script into your browser console
console.log('🧪 Manual Cooldown Test Starting...');

function checkCooldownStatus() {
  const claimedAt = localStorage.getItem("rewardClaimedAt");
  if (claimedAt) {
    const elapsed = Date.now() - parseInt(claimedAt, 10);
    const remaining = 900000 - elapsed;
    if (remaining > 0) {
      console.log(`⏰ Cooldown active! Remaining: ${Math.floor(remaining / 1000 / 60)} minutes and ${Math.floor((remaining % 60000) / 1000)} seconds`);
      return remaining;
    } else {
      console.log('✅ No cooldown active');
      return 0;
    }
  } else {
    console.log('✅ No cooldown found in localStorage');
    return 0;
  }
}

function simulateRecentClaim(minutesAgo = 5) {
  const now = Date.now();
  const claimedAt = now - (minutesAgo * 60 * 1000);
  localStorage.setItem("rewardClaimedAt", claimedAt.toString());
  console.log(`🎯 Simulated claim ${minutesAgo} minutes ago`);
  checkCooldownStatus();
}

function clearCooldown() {
  localStorage.removeItem("rewardClaimedAt");
  console.log('🗑️ Cooldown cleared');
}

function testPageBehavior() {
  console.log('📋 Current page state:');
  console.log('- URL:', window.location.href);
  console.log('- Cooldown status:', checkCooldownStatus());
  
  const thankYouOverlay = document.querySelector('.fixed.inset-0.z-0');
  if (thankYouOverlay) {
    console.log('✅ Thank you overlay is visible');
  } else {
    console.log('❌ Thank you overlay not visible');
  }
  
  const cardElement = document.querySelector('.card-animation');
  if (cardElement) {
    console.log('✅ Card is visible');
  } else {
    console.log('❌ Card not visible');
  }
}

// Export functions
window.cooldownTest = {
  checkStatus: checkCooldownStatus,
  simulateClaim: simulateRecentClaim,
  clear: clearCooldown,
  testPage: testPageBehavior
};

console.log('✅ Test functions loaded! Use: cooldownTest.checkStatus(), cooldownTest.simulateClaim(5), cooldownTest.clear(), cooldownTest.testPage()');
checkCooldownStatus();
```

## Quick Test Commands

After running the script above, you can use these commands:

1. **Check current cooldown**:
   ```javascript
   cooldownTest.checkStatus()
   ```

2. **Simulate a recent claim**:
   ```javascript
   cooldownTest.simulateClaim(5) // 5 minutes ago
   ```

3. **Clear cooldown**:
   ```javascript
   cooldownTest.clear()
   ```

4. **Test page state**:
   ```javascript
   cooldownTest.testPage()
   ```

## Manual localStorage Testing (Alternative)

For direct localStorage manipulation:

1. **Simulate an active cooldown**:
   ```javascript
   localStorage.setItem("rewardClaimedAt", (Date.now() - 600000).toString()); // 10 minutes ago
   ```

2. **Clear cooldown**:
   ```javascript
   localStorage.removeItem("rewardClaimedAt");
   ```

3. **Check current cooldown status**:
   ```javascript
   const claimedAt = localStorage.getItem("rewardClaimedAt");
   if (claimedAt) {
     const elapsed = Date.now() - parseInt(claimedAt, 10);
     const remaining = 900000 - elapsed;
     console.log(`Cooldown remaining: ${Math.floor(remaining / 1000 / 60)} minutes`);
   } else {
     console.log("No cooldown active");
   }
   ```

## Expected Behavior

### Before Changes (Old Behavior)
- User claims a reward
- User refreshes the page
- **Result**: New reward is generated (undesired)

### After Changes (New Behavior)
- User claims a reward
- User refreshes the page
- **Result**: Thank you overlay is still displayed with countdown (desired)

## Technical Details

The implementation uses:
- **IP-based storage**: Tries to use the user's IP address for more accurate tracking
- **Fallback storage**: Uses simple localStorage key if IP fetch fails
- **15-minute cooldown**: 900,000 milliseconds
- **Immediate cooldown check**: Runs before any card fetching
- **Loading state management**: Prevents race conditions during cooldown checks

## Troubleshooting

If the cooldown isn't working:

1. **Check browser console** for any errors
2. **Verify localStorage** is working in your browser
3. **Check network requests** to ensure IP fetch isn't failing
4. **Clear browser cache** and try again
5. **Test in incognito mode** to ensure no cached state

## Files Modified

- `src/app/claim-reward/[zip-code]/page.tsx` - Main implementation
- `test-cooldown.js` - Automated test script (optional)
- `COOLDOWN_TEST_GUIDE.md` - This guide 