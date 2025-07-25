import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugCloudFront() {
  console.log('🔍 CloudFront Debug Diagnostics');
  console.log('=' .repeat(50));

  const productionUrl = 'https://www.qrewards.net';
  const testImagePath = path.join(__dirname, 'test-logo.png');

  try {
    // Test 1: Check if the API route exists at all
    console.log('1️⃣ Testing API route existence...');
    const getResponse = await fetch(`${productionUrl}/api/business/upload-logo`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QRewards-Test)'
      }
    });

    console.log(`   GET Status: ${getResponse.status}`);
    console.log(`   GET Status Text: ${getResponse.statusText}`);

    // Test 2: Check OPTIONS with different headers
    console.log('\n2️⃣ Testing OPTIONS with different configurations...');
    
    const optionsTests = [
      {
        name: 'Basic OPTIONS',
        headers: {}
      },
      {
        name: 'CORS Preflight',
        headers: {
          'Origin': 'https://www.qrewards.net',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      },
      {
        name: 'Full CORS Headers',
        headers: {
          'Origin': 'https://www.qrewards.net',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        }
      }
    ];

    for (const test of optionsTests) {
      const response = await fetch(`${productionUrl}/api/business/upload-logo`, {
        method: 'OPTIONS',
        headers: test.headers
      });
      
      console.log(`   ${test.name}: ${response.status} - ${response.statusText}`);
      console.log(`     CORS Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
      console.log(`     CORS Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
    }

    // Test 3: Test POST with different content types
    console.log('\n3️⃣ Testing POST with different configurations...');
    
    const fileBuffer = fs.readFileSync(testImagePath);
    const file = new File([fileBuffer], 'test-logo.png', { type: 'image/png' });
    
    const postTests = [
      {
        name: 'Basic POST',
        formData: new FormData(),
        headers: {}
      },
      {
        name: 'POST with Origin',
        formData: new FormData(),
        headers: {
          'Origin': 'https://www.qrewards.net'
        }
      },
      {
        name: 'POST with Referer',
        formData: new FormData(),
        headers: {
          'Referer': 'https://www.qrewards.net/business/dashboard'
        }
      },
      {
        name: 'POST with User-Agent',
        formData: new FormData(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
        }
      }
    ];

    for (const test of postTests) {
      test.formData.append('logo', file);
      test.formData.append('businessName', 'TestBusiness');
      
      const response = await fetch(`${productionUrl}/api/business/upload-logo`, {
        method: 'POST',
        body: test.formData,
        headers: test.headers
      });
      
      console.log(`   ${test.name}: ${response.status} - ${response.statusText}`);
      
      if (response.status === 403) {
        try {
          const errorText = await response.text();
          console.log(`     Error: ${errorText.substring(0, 100)}...`);
        } catch (e) {
          console.log(`     Could not read error response`);
        }
      }
    }

    // Test 4: Check if other API routes work
    console.log('\n4️⃣ Testing other API routes...');
    
    const otherRoutes = [
      '/api/ip',
      '/api/test-aws',
      '/api/business/analytics'
    ];

    for (const route of otherRoutes) {
      try {
        const response = await fetch(`${productionUrl}${route}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; QRewards-Test)'
          }
        });
        
        console.log(`   ${route}: ${response.status} - ${response.statusText}`);
      } catch (error) {
        console.log(`   ${route}: Error - ${error.message}`);
      }
    }

    // Test 5: Check CloudFront headers
    console.log('\n5️⃣ Checking CloudFront headers...');
    
    const cfResponse = await fetch(`${productionUrl}/api/business/upload-logo`, {
      method: 'OPTIONS'
    });
    
    const cfHeaders = [
      'x-amz-cf-id',
      'x-amz-cf-pop',
      'x-cache',
      'via',
      'server'
    ];
    
    for (const header of cfHeaders) {
      const value = cfResponse.headers.get(header);
      if (value) {
        console.log(`   ${header}: ${value}`);
      }
    }

    console.log('\n📊 Analysis:');
    console.log('=' .repeat(50));
    
    if (getResponse.status === 404) {
      console.log('🔍 Issue: API route not found (404)');
      console.log('💡 Solution: Check if the API route is properly deployed');
    } else if (getResponse.status === 403) {
      console.log('🔍 Issue: CloudFront blocking all requests to API routes');
      console.log('💡 Solution: Check CloudFront distribution settings');
    } else {
      console.log('🔍 Issue: CloudFront blocking POST requests specifically');
      console.log('💡 Solution: Check CloudFront behavior settings for POST methods');
    }
    
    console.log('\n🔧 Recommended Actions:');
    console.log('1. Check CloudFront distribution behaviors');
    console.log('2. Verify API routes are included in the distribution');
    console.log('3. Check if there are any WAF rules blocking POST requests');
    console.log('4. Consider using the Lambda function approach as a workaround');

  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`);
  }
}

// Run the debug
debugCloudFront().catch(console.error); 