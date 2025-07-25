import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyProductionUpload() {
  console.log('🔍 Verifying Production Upload Fix');
  console.log('=' .repeat(50));

  const productionUrl = 'https://www.qrewards.net';
  const testImagePath = path.join(__dirname, 'test-logo.png');

  try {
    // Test 1: Check if the API endpoint is accessible
    console.log('1️⃣ Testing API endpoint...');
    const healthCheck = await fetch(`${productionUrl}/api/business/upload-logo`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.qrewards.net',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log(`   Status: ${healthCheck.status}`);
    console.log(`   CORS Headers: ${healthCheck.headers.get('Access-Control-Allow-Origin')}`);

    if (healthCheck.status !== 200) {
      console.log('   ❌ API endpoint not accessible yet');
      console.log('   💡 Wait a few minutes for deployment to complete');
      return false;
    }

    // Test 2: Attempt file upload
    console.log('\n2️⃣ Testing file upload...');
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(testImagePath);
    const file = new File([fileBuffer], 'test-logo.png', { type: 'image/png' });
    formData.append('logo', file);
    formData.append('businessName', 'TestBusiness');

    const uploadResponse = await fetch(`${productionUrl}/api/business/upload-logo`, {
      method: 'POST',
      body: formData,
      headers: {
        'Origin': 'https://www.qrewards.net'
      }
    });

    console.log(`   Status: ${uploadResponse.status}`);

    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('   ✅ Upload successful!');
      console.log(`   Logo URL: ${result.logoUrl}`);
      console.log('\n🎉 Production upload is now working!');
      return true;
    } else {
      console.log('   ❌ Upload still failing');
      
      if (uploadResponse.status === 403) {
        console.log('   🔍 Still getting 403 - deployment may not be complete');
        console.log('   💡 Wait 5-10 minutes and try again');
      } else {
        console.log(`   🔍 Status: ${uploadResponse.status} - ${uploadResponse.statusText}`);
      }
      
      return false;
    }

  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
    return false;
  }
}

// Run the verification
verifyProductionUpload().catch(console.error); 