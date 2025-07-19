// Browser Console Debug Script for Logo Upload
// Run this in the browser console on the business dashboard page

console.log('🔍 Debugging Logo Upload Process...\n');

// Check current business data
const businessData = sessionStorage.getItem('businessData');
if (businessData) {
  const business = JSON.parse(businessData);
  console.log('📋 Current Business Data:');
  console.log('ID:', business.id);
  console.log('Name:', business.name);
  console.log('Logo:', business.logo || 'No logo');
  console.log('Logo type:', typeof business.logo);
}

// Test the logo upload API
async function testLogoUploadAPI() {
  console.log('\n🔄 Testing Logo Upload API...');
  
  // Create a simple test image (1x1 pixel PNG)
  const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  try {
    // Convert base64 to blob
    const response = await fetch(testImageData);
    const blob = await response.blob();
    
    // Create FormData
    const formData = new FormData();
    formData.append('logo', blob, 'test-logo.png');
    formData.append('businessName', 'Test Business');
    
    const uploadResponse = await fetch('/api/business/upload-logo', {
      method: 'POST',
      body: formData,
    });

    console.log('📋 Upload API Response Status:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('✅ Logo upload successful:', result);
      console.log('📋 Logo URL:', result.logoUrl);
      
      // Now test updating the business with this logo
      console.log('\n🔄 Testing business update with uploaded logo...');
      await testBusinessUpdateWithLogo(result.logoUrl);
    } else {
      const error = await uploadResponse.json();
      console.error('❌ Logo upload failed:', error);
    }
  } catch (error) {
    console.error('❌ Logo upload error:', error);
  }
}

// Test business update with a specific logo URL
async function testBusinessUpdateWithLogo(logoUrl) {
  if (!businessData) {
    console.log('❌ No business data found');
    return;
  }
  
  const business = JSON.parse(businessData);
  
  try {
    const response = await fetch('/api/business/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessId: business.id,
        logo: logoUrl,
      }),
    });

    console.log('📋 Business Update Response Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Business update successful:', result);
      console.log('📋 Updated logo:', result.business.logo);
      
      // Update session storage
      const updatedBusiness = { ...business, logo: logoUrl };
      sessionStorage.setItem('businessData', JSON.stringify(updatedBusiness));
      console.log('✅ Session storage updated');
      
      // Verify the update
      console.log('\n🔄 Verifying update...');
      const verifyResponse = await fetch(`/api/business/get-business?businessId=${business.id}`);
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log('📋 Verified logo:', verifyResult.business.logo);
        
        if (verifyResult.business.logo === logoUrl) {
          console.log('🎉 Logo upload and update process works correctly!');
        } else {
          console.log('⚠️ Logo mismatch - verification failed');
        }
      }
    } else {
      const error = await response.json();
      console.error('❌ Business update failed:', error);
    }
  } catch (error) {
    console.error('❌ Business update error:', error);
  }
}

// Run tests
console.log('🔧 Running tests...');
testLogoUploadAPI();

console.log('\n📋 Manual Test Steps:');
console.log('1. Try uploading a logo through the UI');
console.log('2. Check the console for detailed logs');
console.log('3. If upload fails, check the error messages above');
console.log('4. Verify the logo appears in the business profile after upload'); 