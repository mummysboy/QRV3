// Test script to verify add business functionality
console.log('🧪 Testing add business functionality...');

// Test 1: Check if user data is available
console.log('\n📋 Test 1: User Data Availability');
const userData = sessionStorage.getItem('businessUser');
const businessData = sessionStorage.getItem('businessData');

if (userData) {
  try {
    const userObj = JSON.parse(userData);
    console.log('✅ User data found in sessionStorage:', {
      email: userObj.email,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      id: userObj.id,
      role: userObj.role
    });
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
  }
} else {
  console.log('⚠️ No user data in sessionStorage');
}

// Test 2: Check if business data is available
console.log('\n📋 Test 2: Business Data Availability');
if (businessData) {
  try {
    const businessObj = JSON.parse(businessData);
    console.log('✅ Business data found in sessionStorage:', {
      name: businessObj.name,
      id: businessObj.id,
      status: businessObj.status,
      email: businessObj.email
    });
  } catch (error) {
    console.error('❌ Error parsing business data:', error);
  }
} else {
  console.log('⚠️ No business data in sessionStorage');
}

// Test 3: Test session API
console.log('\n📋 Test 3: Session API Test');
async function testSessionAPI() {
  try {
    const response = await fetch('/api/business/check-session');
    const data = await response.json();
    
    if (data.hasSession && data.user) {
      console.log('✅ Session API working correctly:', {
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        id: data.user.id,
        role: data.user.role
      });
    } else {
      console.log('❌ Session API returned no user data');
    }
  } catch (error) {
    console.error('❌ Error testing session API:', error);
  }
}

// Test 4: Simulate add business request
console.log('\n📋 Test 4: Add Business Request Simulation');
async function testAddBusinessRequest() {
  try {
    // Get user data from sessionStorage or session API
    let userEmail, userFirstName, userLastName;
    
    if (userData) {
      const userObj = JSON.parse(userData);
      userEmail = userObj.email;
      userFirstName = userObj.firstName;
      userLastName = userObj.lastName;
    } else {
      // Fallback to session API
      const response = await fetch('/api/business/check-session');
      const data = await response.json();
      
      if (data.hasSession && data.user) {
        userEmail = data.user.email;
        userFirstName = data.user.firstName;
        userLastName = data.user.lastName;
      }
    }
    
    if (userEmail && userFirstName && userLastName) {
      console.log('✅ User data available for add business request:', {
        email: userEmail,
        firstName: userFirstName,
        lastName: userLastName
      });
      
      // Simulate the request headers that would be sent
      const headers = {
        'x-user-email': userEmail,
        'x-user-firstname': userFirstName,
        'x-user-lastname': userLastName
      };
      
      console.log('📋 Request headers would be:', headers);
      console.log('✅ Add business functionality should work correctly!');
    } else {
      console.log('❌ User data not available for add business request');
    }
  } catch (error) {
    console.error('❌ Error testing add business request:', error);
  }
}

// Run tests
testSessionAPI().then(() => {
  testAddBusinessRequest().then(() => {
    console.log('\n🎉 Add business functionality test completed!');
  });
}); 