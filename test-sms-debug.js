#!/usr/bin/env node

/**
 * Debug SMS Sending Issue
 * 
 * This script helps identify why SMS messages aren't being received.
 * 
 * Usage:
 * node test-sms-debug.js
 */

const http = require('http');

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: data ? 'POST' : 'GET',
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {}
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = data ? JSON.parse(body) : body;
          resolve({ 
            status: res.statusCode, 
            data: response,
            headers: res.headers
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function debugSMS() {
  console.log('📱 Debugging SMS Sending Issue\n');
  console.log('Your phone number: 4155724853\n');

  try {
    // Test 1: Check if the API returns success
    console.log('1. Testing SMS API response...');
    const smsResponse = await makeRequest('/api/admin/send-mfa', {
      phoneNumber: '4155724853'
    });

    if (smsResponse.status === 200) {
      console.log('✅ API returns success');
      console.log(`   Response: ${JSON.stringify(smsResponse.data)}`);
    } else {
      console.log(`❌ API error (Status: ${smsResponse.status})`);
      console.log(`   Error: ${JSON.stringify(smsResponse.data)}`);
      return;
    }

    // Test 2: Check server logs for SNS errors
    console.log('\n2. Common SMS Issues:');
    console.log('   🔍 Check your terminal/server logs for SNS errors');
    console.log('   📱 Verify your phone number is correct: 4155724853');
    console.log('   🌍 Check if you have international SMS enabled');

    // Test 3: AWS SNS Configuration Issues
    console.log('\n3. AWS SNS Configuration Issues:');
    console.log('   ❌ Missing AWS credentials');
    console.log('   ❌ AWS SNS not configured for SMS');
    console.log('   ❌ Phone number not verified in AWS SNS');
    console.log('   ❌ AWS region mismatch (should be us-west-1)');
    console.log('   ❌ SMS spending limit exceeded');
    console.log('   ❌ Account in SMS sandbox mode');

    // Test 4: Phone-specific issues
    console.log('\n4. iPhone-specific issues:');
    console.log('   📱 Check if SMS is enabled in iPhone settings');
    console.log('   📱 Verify you have cellular service');
    console.log('   📱 Check if you have any SMS blockers');
    console.log('   📱 Try sending to a different phone number');

    // Test 5: Solutions
    console.log('\n5. Solutions to try:');
    console.log('   🔧 Check AWS SNS console for SMS status');
    console.log('   🔧 Verify phone number in AWS SNS');
    console.log('   🔧 Check AWS credentials in environment');
    console.log('   🔧 Request SMS sandbox exit from AWS');
    console.log('   🔧 Test with a different phone number');

    console.log('\n📋 Next steps:');
    console.log('1. Check your terminal/server logs for SNS errors');
    console.log('2. Verify AWS SNS is configured for SMS');
    console.log('3. Check if your phone number is verified in AWS');
    console.log('4. Try with a different phone number for testing');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugSMS(); 