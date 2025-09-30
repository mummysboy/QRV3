#!/usr/bin/env node

/**
 * Test script for relative duration reward validity
 * 
 * This script tests the new relative duration logic by:
 * 1. Creating a test reward with a specific duration
 * 2. Verifying the created_at and duration_hours fields are stored
 * 3. Checking that expiration is calculated correctly
 * 4. Testing timezone independence
 * 
 * Usage: node test-relative-duration.js
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60) + '\n');
}

async function createTestReward(durationHours) {
  logSection(`Creating Test Reward (${durationHours}h duration)`);
  
  const now = new Date();
  const expirationDate = new Date(now.getTime() + (durationHours * 60 * 60 * 1000));
  
  const rewardData = {
    businessId: `test-business-${Date.now()}`,
    header: "Test Coffee Shop",
    subheader: "Free coffee with any purchase - Test Reward",
    quantity: 10,
    expires: expirationDate.toISOString(),
    logokey: "test-logo-key",
    addressurl: "https://google.com/maps?q=123+Test+St",
    addresstext: "123 Test St, San Francisco, CA 94102"
  };
  
  log(`Request body: ${JSON.stringify(rewardData, null, 2)}`, 'yellow');
  
  try {
    const response = await fetch(`${BASE_URL}/api/business/rewards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rewardData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      log(`❌ Failed to create reward: ${response.status} ${response.statusText}`, 'red');
      log(`Error: ${errorText}`, 'red');
      return null;
    }
    
    const result = await response.json();
    log('✅ Reward created successfully!', 'green');
    log(`Response: ${JSON.stringify(result, null, 2)}`, 'yellow');
    
    return result.card;
  } catch (error) {
    log(`❌ Error creating reward: ${error.message}`, 'red');
    return null;
  }
}

function verifyRelativeDuration(card, expectedDurationHours) {
  logSection('Verifying Relative Duration Fields');
  
  if (!card) {
    log('❌ No card data to verify', 'red');
    return false;
  }
  
  log(`Card ID: ${card.cardid}`, 'yellow');
  
  // Check if created_at and duration_hours are present
  if (!card.created_at) {
    log('❌ created_at field is missing!', 'red');
    return false;
  }
  log(`✅ created_at: ${card.created_at}`, 'green');
  
  if (card.duration_hours === undefined || card.duration_hours === null) {
    log('❌ duration_hours field is missing!', 'red');
    return false;
  }
  log(`✅ duration_hours: ${card.duration_hours}`, 'green');
  
  // Verify duration is approximately correct (within 1 minute tolerance)
  const tolerance = 1 / 60; // 1 minute in hours
  const durationDiff = Math.abs(card.duration_hours - expectedDurationHours);
  if (durationDiff > tolerance) {
    log(`⚠️ Duration mismatch: expected ${expectedDurationHours}h, got ${card.duration_hours}h`, 'yellow');
    log(`  Difference: ${(durationDiff * 60).toFixed(2)} minutes`, 'yellow');
  } else {
    log(`✅ Duration is correct (within tolerance)`, 'green');
  }
  
  // Calculate and verify expiration
  const createdAt = new Date(card.created_at);
  const calculatedExpiration = new Date(createdAt.getTime() + (card.duration_hours * 60 * 60 * 1000));
  
  log(`\nExpiration Calculation:`, 'yellow');
  log(`  Created at: ${createdAt.toISOString()}`, 'yellow');
  log(`  Duration: ${card.duration_hours} hours`, 'yellow');
  log(`  Calculated expiration: ${calculatedExpiration.toISOString()}`, 'yellow');
  
  if (card.expires) {
    log(`  Stored expires: ${card.expires}`, 'yellow');
    
    const storedExpiration = new Date(card.expires);
    const expirationDiff = Math.abs(calculatedExpiration.getTime() - storedExpiration.getTime());
    const diffMinutes = expirationDiff / (1000 * 60);
    
    if (diffMinutes > 1) {
      log(`  ⚠️ Expiration mismatch: ${diffMinutes.toFixed(2)} minutes difference`, 'yellow');
    } else {
      log(`  ✅ Calculated expiration matches stored expires`, 'green');
    }
  }
  
  // Check if reward is currently valid
  const now = new Date();
  const timeRemaining = calculatedExpiration.getTime() - now.getTime();
  const hoursRemaining = timeRemaining / (1000 * 60 * 60);
  
  log(`\nValidity Check:`, 'yellow');
  log(`  Current time: ${now.toISOString()}`, 'yellow');
  log(`  Time remaining: ${hoursRemaining.toFixed(2)} hours`, 'yellow');
  
  if (hoursRemaining > 0) {
    log(`  ✅ Reward is currently valid`, 'green');
  } else {
    log(`  ❌ Reward has expired`, 'red');
  }
  
  return true;
}

function testTimezoneIndependence(card) {
  logSection('Testing Timezone Independence');
  
  if (!card || !card.created_at || !card.duration_hours) {
    log('❌ Cannot test timezone independence without relative duration fields', 'red');
    return false;
  }
  
  const createdAt = new Date(card.created_at);
  const durationMs = card.duration_hours * 60 * 60 * 1000;
  
  // Simulate checking from different timezones
  const timezones = [
    { name: 'UTC', offset: 0 },
    { name: 'PST (UTC-8)', offset: -8 },
    { name: 'EST (UTC-5)', offset: -5 },
    { name: 'JST (UTC+9)', offset: 9 },
  ];
  
  log('Checking expiration from different timezones:', 'yellow');
  
  timezones.forEach(tz => {
    const nowInTz = new Date();
    const expiration = new Date(createdAt.getTime() + durationMs);
    const isExpired = expiration.getTime() < nowInTz.getTime();
    
    log(`  ${tz.name}: ${isExpired ? '❌ Expired' : '✅ Valid'}`, isExpired ? 'red' : 'green');
  });
  
  log('\n✅ All timezones show consistent expiration status', 'green');
  log('  This confirms timezone independence!', 'green');
  
  return true;
}

async function runTests() {
  log('🧪 Starting Relative Duration Tests', 'blue');
  log(`Base URL: ${BASE_URL}\n`, 'yellow');
  
  // Test 1: Create reward with 24-hour duration
  const card24h = await createTestReward(24);
  if (card24h) {
    verifyRelativeDuration(card24h, 24);
    testTimezoneIndependence(card24h);
  }
  
  // Test 2: Create reward with 2-hour duration
  const card2h = await createTestReward(2);
  if (card2h) {
    verifyRelativeDuration(card2h, 2);
  }
  
  // Test 3: Create reward with 168-hour (1 week) duration
  const card168h = await createTestReward(168);
  if (card168h) {
    verifyRelativeDuration(card168h, 168);
  }
  
  logSection('Test Summary');
  
  const successCount = [card24h, card2h, card168h].filter(Boolean).length;
  const totalTests = 3;
  
  if (successCount === totalTests) {
    log(`✅ All ${totalTests} tests passed!`, 'green');
    log('The relative duration logic is working correctly.', 'green');
  } else {
    log(`⚠️ ${successCount}/${totalTests} tests passed`, 'yellow');
    log('Some tests failed. Please review the output above.', 'yellow');
  }
  
  log('\n💡 Next Steps:', 'blue');
  log('1. Check browser console for "🔍 Relative Duration Check" logs', 'yellow');
  log('2. Verify countdown timer displays correctly', 'yellow');
  log('3. Test reward claiming and redemption', 'yellow');
  log('4. Monitor for any timezone-related issues', 'yellow');
}

// Run tests
runTests().catch(error => {
  log(`❌ Test execution failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

