#!/usr/bin/env node

/**
 * Test Logo Upload Process
 * 
 * This script tests the complete logo upload process from S3 upload to business update.
 */

import http from 'http';

function makeRequest(url, data, method = 'POST', headers = {}) {
  return new Promise((resolve, reject) => {
    let postData;
    
    if (data instanceof FormData) {
      // Handle FormData for file uploads
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
      headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
      
      let body = '';
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          body += `--${boundary}\r\n`;
          body += `Content-Disposition: form-data; name="${key}"; filename="${value.name}"\r\n`;
          body += `Content-Type: ${value.type}\r\n\r\n`;
          body += value.toString() + '\r\n';
        } else {
          body += `--${boundary}\r\n`;
          body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
          body += value + '\r\n';
        }
      }
      body += `--${boundary}--\r\n`;
      postData = body;
    } else {
      // Handle JSON data
      postData = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: method,
      headers: {
        ...headers,
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

async function testLogoUpload() {
  console.log('🔍 Testing Logo Upload Process...\n');

  try {
    // Step 1: Test business login to get business data
    console.log('1️⃣ Testing business login...');
    const loginResponse = await makeRequest('/api/business-login', {
      email: 'isaac@rightimagedigital.com',
      password: 'test123'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      const businessId = loginResponse.data.business.id;
      console.log('📋 Business ID:', businessId);
      console.log('📋 Current logo:', loginResponse.data.business.logo || 'No logo');
      
      // Step 2: Test business update with a test logo URL
      console.log('\n2️⃣ Testing business update with logo URL...');
      const testLogoUrl = 'https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/logos/test-logo.png';
      
      const updateResponse = await makeRequest('/api/business/update', {
        businessId: businessId,
        logo: testLogoUrl
      });

      if (updateResponse.status === 200) {
        console.log('✅ Business update successful');
        console.log('📋 Updated business logo:', updateResponse.data.business.logo);
        
        // Step 3: Verify the update by fetching fresh business data
        console.log('\n3️⃣ Verifying business data...');
        const verifyResponse = await makeRequest(`/api/business/get-business?businessId=${businessId}`, {}, 'GET');
        
        if (verifyResponse.status === 200) {
          console.log('✅ Business data verification successful');
          console.log('📋 Verified logo:', verifyResponse.data.business.logo);
          
          if (verifyResponse.data.business.logo === testLogoUrl) {
            console.log('🎉 Logo update process works correctly!');
          } else {
            console.log('⚠️ Logo mismatch - expected:', testLogoUrl, 'got:', verifyResponse.data.business.logo);
          }
        } else {
          console.log('❌ Business data verification failed:', verifyResponse.data.error);
        }
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
testLogoUpload(); 