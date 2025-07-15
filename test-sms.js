#!/usr/bin/env node

/**
 * SMS Test Script
 * Run this after AWS SNS spending limit is increased
 */

import http from 'http';

// Configuration
const TEST_PHONE = '7075598159'; // Your test phone number

// Test SMS endpoint
async function testSMS(phoneNumber) {
  console.log('🧪 Testing SMS functionality...');
  console.log(`📱 Phone number: ${phoneNumber}`);
  
  const postData = JSON.stringify({
    phoneNumber: phoneNumber
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-sms',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📱 Response status:', res.statusCode);
          console.log('📱 Response body:', JSON.stringify(result, null, 2));
          
          if (res.statusCode === 200 && result.success) {
            console.log('✅ SMS test successful!');
            console.log(`📱 Message ID: ${result.messageId}`);
            console.log(`📱 Phone: ${result.phoneNumber}`);
          } else {
            console.log('❌ SMS test failed');
            console.log(`📱 Error: ${result.error}`);
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test reward SMS endpoint
async function testRewardSMS(phoneNumber) {
  console.log('\n🎁 Testing reward SMS functionality...');
  
  const postData = JSON.stringify({
    to: phoneNumber,
    url: 'https://www.qrewards.net/reward/test123',
    header: 'Test Reward'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/send-sms',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('🎁 Response status:', res.statusCode);
          console.log('📱 Response body:', JSON.stringify(result, null, 2));
          
          if (res.statusCode === 200 && result.success) {
            console.log('✅ Reward SMS test successful!');
          } else {
            console.log('❌ Reward SMS test failed');
            console.log(`🎁 Error: ${result.error}`);
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  console.log('🚀 QRewards SMS Test Script');
  console.log('============================\n');
  
  try {
    // Test basic SMS
    await testSMS(TEST_PHONE);
    
    // Test reward SMS
    await testRewardSMS(TEST_PHONE);
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your phone for SMS messages');
    console.log('2. Verify message content is correct');
    console.log('3. Check AWS SNS console for delivery status');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure your app is running on localhost:3000');
    console.log('2. Check AWS SNS spending limit is increased');
    console.log('3. Verify AWS credentials are configured');
    console.log('4. Check network connectivity');
  }
}

// Run if called directly
main().catch(console.error);

export { testSMS, testRewardSMS }; 