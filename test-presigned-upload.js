import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPresignedUpload() {
  console.log('🚀 Testing Presigned Upload Solution');
  console.log('=' .repeat(50));

  const productionUrl = 'https://www.qrewards.net';
  const testImagePath = path.join(__dirname, 'test-logo.png');

  try {
    // Test 1: Check if presigned upload endpoint is accessible
    console.log('1️⃣ Testing presigned upload endpoint...');
    const healthCheck = await fetch(`${productionUrl}/api/business/presigned-upload`, {
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
      console.log('   ❌ Presigned upload endpoint not accessible');
      return false;
    }

    // Test 2: Get presigned URL
    console.log('\n2️⃣ Getting presigned URL...');
    const presignedResponse = await fetch(`${productionUrl}/api/business/presigned-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.qrewards.net'
      },
      body: JSON.stringify({
        businessName: 'TestBusiness',
        fileName: 'test-logo.png',
        contentType: 'image/png'
      })
    });

    console.log(`   Status: ${presignedResponse.status}`);

    if (!presignedResponse.ok) {
      console.log('   ❌ Failed to get presigned URL');
      try {
        const errorData = await presignedResponse.text();
        console.log(`   Error: ${errorData.substring(0, 200)}...`);
      } catch {
        console.log('   Could not read error response');
      }
      return false;
    }

    const { presignedUrl, key } = await presignedResponse.json();
    console.log('   ✅ Got presigned URL successfully');
    console.log(`   Key: ${key}`);

    // Test 3: Upload file using presigned URL
    console.log('\n3️⃣ Uploading file using presigned URL...');
    const fileBuffer = fs.readFileSync(testImagePath);
    const file = new File([fileBuffer], 'test-logo.png', { type: 'image/png' });

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'image/png'
      }
    });

    console.log(`   Status: ${uploadResponse.status}`);

    if (uploadResponse.ok) {
      console.log('   ✅ Direct S3 upload successful!');
      
      // Test 4: Verify the file is accessible
      console.log('\n4️⃣ Verifying uploaded file...');
      const cloudfrontUrl = `https://d2rfrexwuran49.cloudfront.net/${key}`;
      
      try {
        const verifyResponse = await fetch(cloudfrontUrl, { method: 'HEAD' });
        console.log(`   CloudFront URL: ${cloudfrontUrl}`);
        console.log(`   Accessible: ${verifyResponse.ok ? '✅ Yes' : '❌ No'}`);
        
        if (verifyResponse.ok) {
          console.log('\n🎉 Presigned upload solution is working perfectly!');
          console.log('✅ Bypassed CloudFront CORS issues');
          console.log('✅ Direct S3 upload successful');
          console.log('✅ File accessible via CloudFront');
          return true;
        }
      } catch (verifyError) {
        console.log(`   ❌ Could not verify file: ${verifyError.message}`);
      }
    } else {
      console.log('   ❌ Direct S3 upload failed');
      try {
        const errorText = await uploadResponse.text();
        console.log(`   Error: ${errorText.substring(0, 200)}...`);
      } catch {
        console.log('   Could not read error response');
      }
      return false;
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testPresignedUpload().catch(console.error); 