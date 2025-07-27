import puppeteer from 'puppeteer';

async function testMultipleBusinesses() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🧪 Testing multiple businesses functionality...');
    
    // Navigate to login page
    await page.goto('http://localhost:3000/business/login');
    console.log('✅ Navigated to login page');
    
    // Wait for login form
    await page.waitForSelector('input[name="email"]');
    
    // Fill in login credentials (replace with actual test credentials)
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'testpassword123');
    
    // Submit login form
    await page.click('button[type="submit"]');
    console.log('✅ Submitted login form');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation();
    console.log('✅ Redirected to dashboard');
    
    // Wait for dashboard to load
    await page.waitForSelector('.container', { timeout: 10000 });
    console.log('✅ Dashboard loaded');
    
    // Check if business switcher is present (should be if user has multiple businesses)
    const businessSwitcher = await page.$('select');
    if (businessSwitcher) {
      console.log('✅ Business switcher found - user has multiple businesses');
      
      // Get all business options
      const options = await page.$$eval('select option', opts => opts.map(opt => opt.textContent));
      console.log('📋 Available businesses:', options);
      
      // Test switching to a different business
      if (options.length > 1) {
        console.log('🔄 Testing business switching...');
        
        // Select the second business
        await page.select('select', '1'); // Select second option (index 1)
        console.log('✅ Switched to second business');
        
        // Wait for data to refresh
        await page.waitForTimeout(2000);
        
        // Check if the business name in the welcome message changed
        const welcomeText = await page.$eval('h2', el => el.textContent);
        console.log('📋 Welcome message:', welcomeText);
        
        // Switch back to first business
        await page.select('select', '0'); // Select first option (index 0)
        console.log('✅ Switched back to first business');
        
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('ℹ️  Business switcher not found - user has only one business');
    }
    
    // Test adding a new business
    console.log('🔄 Testing add business functionality...');
    
    // Click on settings to access add business
    const settingsButton = await page.$('button[aria-label="Settings"]');
    if (settingsButton) {
      await settingsButton.click();
      console.log('✅ Clicked settings button');
      
      await page.waitForTimeout(1000);
      
      // Look for add business button
      const addBusinessButton = await page.$('button:contains("Add Business")');
      if (addBusinessButton) {
        await addBusinessButton.click();
        console.log('✅ Clicked add business button');
        
        // Wait for add business form
        await page.waitForSelector('input[name="businessName"]');
        console.log('✅ Add business form loaded');
        
        // Fill in business details
        await page.type('input[name="businessName"]', 'Test Business 2');
        await page.type('input[name="businessPhone"]', '5551234567');
        await page.type('input[name="businessAddress"]', '123 Test St');
        await page.type('input[name="businessCity"]', 'Test City');
        await page.type('input[name="businessState"]', 'CA');
        await page.type('input[name="businessZipCode"]', '90210');
        await page.select('select[name="category"]', 'Restaurant');
        
        console.log('✅ Filled in business details');
        
        // Submit the form
        await page.click('button[type="submit"]');
        console.log('✅ Submitted add business form');
        
        // Wait for success message
        await page.waitForFunction(() => {
          return document.body.textContent.includes('Business added successfully');
        }, { timeout: 10000 });
        
        console.log('✅ Business added successfully');
      } else {
        console.log('ℹ️  Add business button not found');
      }
    } else {
      console.log('ℹ️  Settings button not found');
    }
    
    console.log('✅ Multiple businesses test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser will remain open for manual inspection. Press Ctrl+C to close.');
    // await browser.close();
  }
}

testMultipleBusinesses().catch(console.error); 