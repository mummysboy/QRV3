import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const logoUrl = "https://amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3.s3.us-west-1.amazonaws.com/logos/PaddysPancakes-039e484b-11c4-4869-9b54-242cd816da44.png";
  
  console.log("🔍 Testing logo access for:", logoUrl);
  
  try {
    // Test HEAD request (check if file exists and get headers)
    console.log("🔍 Testing HEAD request...");
    const headResponse = await fetch(logoUrl, { method: 'HEAD' });
    console.log("🔍 HEAD response status:", headResponse.status);
    console.log("🔍 HEAD response headers:", Object.fromEntries(headResponse.headers.entries()));
    
    // Test GET request (try to actually fetch the file)
    console.log("🔍 Testing GET request...");
    const getResponse = await fetch(logoUrl);
    console.log("🔍 GET response status:", getResponse.status);
    console.log("🔍 GET response headers:", Object.fromEntries(getResponse.headers.entries()));
    
    // Test with different user agents
    console.log("🔍 Testing with browser user agent...");
    const browserResponse = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log("🔍 Browser response status:", browserResponse.status);
    
    return NextResponse.json({
      success: true,
      logoUrl,
      headStatus: headResponse.status,
      headHeaders: Object.fromEntries(headResponse.headers.entries()),
      getStatus: getResponse.status,
      getHeaders: Object.fromEntries(getResponse.headers.entries()),
      browserStatus: browserResponse.status,
      message: "Logo access test completed"
    });
    
  } catch (error) {
    console.error("❌ Logo access test failed:", error);
    return NextResponse.json({
      success: false,
      logoUrl,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Logo access test failed"
    }, { status: 500 });
  }
} 