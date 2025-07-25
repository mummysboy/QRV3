import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const configs = [
  {
    name: 'Production Domain',
    baseUrl: 'https://www.qrewards.net',
    description: 'Main production domain'
  },
  {
    name: 'Amplify Subdomain',
    baseUrl: 'https://production-ready.d3vrqyegyhgj8x.amplifyapp.com',
    description: 'Amplify subdomain'
  },
  {
    name: 'Local Development',
    baseUrl: 'http://localhost:3000',
    description: 'Local development server'
  }
];

async function testUpload(baseUrl, configName) {
  console.log(`\n🧪 Testing ${configName} (${baseUrl})`);
  console.log('=' .repeat(60));

  try {
    // Test 1: Check if the API endpoint is accessible
    console.log('1️⃣ Testing API endpoint accessibility...');
    const healthCheck = await fetch(`${baseUrl}/api/business/upload-logo`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.qrewards.net',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log(`   Status: ${healthCheck.status}`);
    console.log(`   CORS Headers:`);
    console.log(`     Access-Control-Allow-Origin: ${healthCheck.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`     Access-Control-Allow-Methods: ${healthCheck.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`     Access-Control-Allow-Headers: ${healthCheck.headers.get('Access-Control-Allow-Headers')}`);

    if (healthCheck.status !== 200) {
      console.log('   ❌ API endpoint not accessible');
      return false;
    }

    // Test 2: Create a test image file
    console.log('\n2️⃣ Creating test image...');
    const testImagePath = path.join(__dirname, 'test-logo.png');
    
    // Use an existing logo file if available, otherwise create a simple one
    const existingLogoPath = path.join(__dirname, 'public', 'logo.png');
    
    if (fs.existsSync(existingLogoPath)) {
      // Copy the existing logo
      fs.copyFileSync(existingLogoPath, testImagePath);
      console.log('   Using existing logo.png as test image');
    } else {
      // Create a simple test image using a base64 encoded PNG
      const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const buffer = Buffer.from(base64PNG, 'base64');
      fs.writeFileSync(testImagePath, buffer);
      console.log('   Created simple test image');
    }

    // Test 3: Attempt file upload
    console.log('\n3️⃣ Testing file upload...');
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(testImagePath);
    const file = new File([fileBuffer], 'test-logo.png', { type: 'image/png' });
    formData.append('logo', file);
    formData.append('businessName', 'TestBusiness');

    const uploadResponse = await fetch(`${baseUrl}/api/business/upload-logo`, {
      method: 'POST',
      body: formData,
      headers: {
        'Origin': 'https://www.qrewards.net'
      }
    });

    console.log(`   Status: ${uploadResponse.status}`);
    console.log(`   Status Text: ${uploadResponse.statusText}`);

    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('   ✅ Upload successful!');
      console.log(`   Logo URL: ${result.logoUrl}`);
      return true;
    } else {
      console.log('   ❌ Upload failed');
      
      // Try to get error details
      try {
        const errorData = await uploadResponse.text();
        console.log(`   Error Response: ${errorData.substring(0, 200)}...`);
      } catch {
        console.log('   Could not read error response');
      }

      // Check for specific error types
      if (uploadResponse.status === 403) {
        console.log('   🔍 403 Forbidden - This suggests a CORS or CloudFront issue');
        console.log('   💡 Possible solutions:');
        console.log('      - Check CloudFront CORS configuration');
        console.log('      - Verify API route is properly deployed');
        console.log('      - Check AWS credentials and permissions');
      } else if (uploadResponse.status === 404) {
        console.log('   🔍 404 Not Found - API route not found');
        console.log('   💡 Possible solutions:');
        console.log('      - Verify the API route is deployed');
        console.log('      - Check the URL path');
      } else if (uploadResponse.status === 500) {
        console.log('   🔍 500 Internal Server Error - Server-side issue');
        console.log('   💡 Check server logs for details');
      }

      return false;
    }

  } catch (error) {
    console.log(`   ❌ Test failed with error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Production Upload Tests');
  console.log('This will test logo upload functionality across different environments\n');

  const results = [];

  for (const config of configs) {
    const success = await testUpload(config.baseUrl, config.name);
    results.push({
      name: config.name,
      baseUrl: config.baseUrl,
      success,
      description: config.description
    });
  }

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    console.log(`   URL: ${result.baseUrl}`);
    console.log(`   Description: ${result.description}`);
    console.log('');
  });

  // Recommendations
  console.log('💡 Recommendations:');
  const failedTests = results.filter(r => !r.success);
  
  if (failedTests.length === 0) {
    console.log('   🎉 All tests passed! Your upload functionality is working correctly.');
  } else {
    console.log('   🔧 Issues detected. Here are some steps to resolve:');
    
    failedTests.forEach(test => {
      console.log(`   - ${test.name}: Check CloudFront CORS settings and API route deployment`);
    });
    
    console.log('\n   📋 Next steps:');
    console.log('   1. Deploy the updated CORS configuration');
    console.log('   2. Check CloudFront distribution settings');
    console.log('   3. Verify AWS credentials and permissions');
    console.log('   4. Check Amplify build logs for any deployment issues');
  }
}

// Run the tests
runTests().catch(console.error); 