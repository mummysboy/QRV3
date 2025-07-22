// Browser-based Logo Upload Test Script
// Copy and paste this into your browser console on your hosted site

console.log('🧪 Browser Logo Upload Test\n');

async function testLogoUpload() {
  try {
    // Test 1: Check S3 access
    console.log('📋 Test 1: S3 Access');
    const s3Response = await fetch('/api/test-s3');
    const s3Data = await s3Response.json();
    console.log('✅ S3 Access:', s3Data.success ? 'Working' : 'Failed');
    console.log('   Bucket:', s3Data.bucketName);
    console.log('   Region:', s3Data.region);
    console.log('   Objects:', s3Data.totalObjects);
    
    // Test 2: Check upload functionality
    console.log('\n📋 Test 2: Upload Functionality');
    const uploadResponse = await fetch('/api/test-s3-upload');
    const uploadData = await uploadResponse.json();
    console.log('✅ Upload Test:', uploadData.uploadSuccess ? 'Working' : 'Failed');
    console.log('   Bucket Accessible:', uploadData.bucketAccessible);
    console.log('   Has Credentials:', uploadData.hasCredentials);
    
    // Test 3: Test actual logo upload API
    console.log('\n📋 Test 3: Logo Upload API');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('logo', blob, 'test-logo.png');
    formData.append('businessName', 'Test Business');
    
    console.log('🔄 Attempting logo upload...');
    const logoUploadResponse = await fetch('/api/business/upload-logo', {
      method: 'POST',
      body: formData
    });
    
    console.log('   Response Status:', logoUploadResponse.status);
    console.log('   Response OK:', logoUploadResponse.ok);
    
    if (logoUploadResponse.ok) {
      const logoData = await logoUploadResponse.json();
      console.log('✅ Logo Upload:', 'Success');
      console.log('   Logo URL:', logoData.logoUrl);
    } else {
      const errorData = await logoUploadResponse.json();
      console.log('❌ Logo Upload:', 'Failed');
      console.log('   Error:', errorData.error);
      console.log('   Details:', errorData.details);
    }
    
    // Test 4: Check CORS headers
    console.log('\n📋 Test 4: CORS Headers');
    const corsResponse = await fetch('/api/business/upload-logo', {
      method: 'OPTIONS'
    });
    console.log('   CORS Allowed Origin:', corsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   CORS Allowed Methods:', corsResponse.headers.get('Access-Control-Allow-Methods'));
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Test the LogoUpload component directly
function testLogoUploadComponent() {
  console.log('\n🧪 Testing LogoUpload Component');
  
  // Find the LogoUpload component
  const logoUploadArea = document.querySelector('[onClick*="triggerFileInput"], [onclick*="triggerFileInput"]');
  if (logoUploadArea) {
    console.log('✅ Found LogoUpload component');
    
    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      console.log('✅ Found file input');
      
      // Create a test file
      const testImageBuffer = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
        0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      const testFile = new File([testImageBuffer], 'test-logo.png', { type: 'image/png' });
      
      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);
      fileInput.files = dataTransfer.files;
      
      // Trigger the change event
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
      
      console.log('✅ Triggered file upload event');
    } else {
      console.log('❌ File input not found');
    }
  } else {
    console.log('❌ LogoUpload component not found');
  }
}

// Run both tests
testLogoUpload().then(() => {
  setTimeout(testLogoUploadComponent, 1000);
});

console.log('📋 Test functions available:');
console.log('   testLogoUpload() - Test API endpoints');
console.log('   testLogoUploadComponent() - Test component interaction'); 