#!/usr/bin/env node

/**
 * Test Business Logo
 * 
 * This script tests the business logo upload and storage process.
 */

import http from 'http';

function makeRequest(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ 
            status: res.statusCode, 
            data: response
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testBusinessLogo() {
  console.log('🔍 Testing Business Logo Process...\n');

  try {
    // Step 1: Test business login to get business data
    console.log('1️⃣ Testing business login...');
    const loginResponse = await makeRequest('/api/business-login', {
      email: 'isaac@rightimagedigital.com',
      password: 'test123'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('📋 Business data:', {
        id: loginResponse.data.business.id,
        name: loginResponse.data.business.name,
        logo: loginResponse.data.business.logo || 'No logo',
        logoType: typeof loginResponse.data.business.logo,
        logoLength: loginResponse.data.business.logo ? loginResponse.data.business.logo.length : 0
      });
      
      const businessId = loginResponse.data.business.id;
      
      // Step 2: Test business update with logo
      console.log('\n2️⃣ Testing business update with logo...');
      const updateResponse = await makeRequest('/api/business/update', {
        businessId: businessId,
        logo: 'https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/logos/test-logo.png'
      });

      if (updateResponse.status === 200) {
        console.log('✅ Business update successful');
        console.log('📋 Updated business data:', {
          id: updateResponse.data.business.id,
          name: updateResponse.data.business.name,
          logo: updateResponse.data.business.logo || 'No logo',
          logoType: typeof updateResponse.data.business.logo,
          logoLength: updateResponse.data.business.logo ? updateResponse.data.business.logo.length : 0
        });
      } else {
        console.log('❌ Business update failed:', updateResponse.data.error);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBusinessLogo(); 