import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testLogoUploadWithDelete() {
  console.log('🧪 Testing Logo Upload with Old Logo Deletion');
  console.log('=============================================');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  // Use an existing PNG file from the public directory
  const testImagePath = path.join(__dirname, 'public', 'logo.png');
  
  if (!fs.existsSync(testImagePath)) {
    console.error('❌ Test image not found:', testImagePath);
    return;
  }
  
  // Read the existing PNG file
  const pngBuffer = fs.readFileSync(testImagePath);
  console.log('✅ Using existing test image file:', testImagePath);
  console.log('📋 Image size:', pngBuffer.length, 'bytes');

  try {
    // First upload - should not delete anything
    console.log('\n📤 First upload (no current logo)...');
    const formData1 = new FormData();
    formData1.append('logo', new Blob([pngBuffer], { type: 'image/png' }), 'test-logo.png');
    formData1.append('businessName', 'TestBusiness');

    const response1 = await fetch(`${baseUrl}/api/business/upload-logo`, {
      method: 'POST',
      body: formData1,
    });

    console.log('   Response Status:', response1.status);
    console.log('   Response OK:', response1.ok);

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('   ✅ First upload successful');
      console.log('   Logo URL:', data1.logoUrl);
      
      const firstLogoUrl = data1.logoUrl;
      
      // Second upload - should delete the first logo
      console.log('\n📤 Second upload (with current logo)...');
      const formData2 = new FormData();
      formData2.append('logo', new Blob([pngBuffer], { type: 'image/png' }), 'test-logo2.png');
      formData2.append('businessName', 'TestBusiness');
      formData2.append('currentLogo', firstLogoUrl);

      const response2 = await fetch(`${baseUrl}/api/business/upload-logo`, {
        method: 'POST',
        body: formData2,
      });

      console.log('   Response Status:', response2.status);
      console.log('   Response OK:', response2.ok);

      if (response2.ok) {
        const data2 = await response2.json();
        console.log('   ✅ Second upload successful');
        console.log('   New Logo URL:', data2.logoUrl);
        console.log('   Old Logo URL (should be deleted):', firstLogoUrl);
        
        // Third upload - should delete the second logo
        console.log('\n📤 Third upload (with current logo)...');
        const formData3 = new FormData();
        formData3.append('logo', new Blob([pngBuffer], { type: 'image/png' }), 'test-logo3.png');
        formData3.append('businessName', 'TestBusiness');
        formData3.append('currentLogo', data2.logoUrl);

        const response3 = await fetch(`${baseUrl}/api/business/upload-logo`, {
          method: 'POST',
          body: formData3,
        });

        console.log('   Response Status:', response3.status);
        console.log('   Response OK:', response3.ok);

        if (response3.ok) {
          const data3 = await response3.json();
          console.log('   ✅ Third upload successful');
          console.log('   Final Logo URL:', data3.logoUrl);
          console.log('   Previous Logo URL (should be deleted):', data2.logoUrl);
          
          console.log('\n🎉 Test completed successfully!');
          console.log('   - First logo uploaded:', firstLogoUrl);
          console.log('   - Second logo uploaded:', data2.logoUrl);
          console.log('   - Third logo uploaded:', data3.logoUrl);
          console.log('   - Old logos should have been automatically deleted from S3');
        } else {
          const errorData = await response3.json();
          console.error('   ❌ Third upload failed:', errorData);
        }
      } else {
        const errorData = await response2.json();
        console.error('   ❌ Second upload failed:', errorData);
      }
    } else {
      const errorData = await response1.json();
      console.error('   ❌ First upload failed:', errorData);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLogoUploadWithDelete().catch(console.error); 