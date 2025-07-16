import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test different logo URL formats
    const testLogos = [
      {
        name: "S3 URL",
        logokey: "https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/logos/test-logo.png",
        expected: "Should display as-is"
      },
      {
        name: "S3 Key with slash",
        logokey: "/logos/test-logo.png",
        expected: "Should construct full URL"
      },
      {
        name: "S3 Key without slash",
        logokey: "logos/test-logo.png",
        expected: "Should construct full URL"
      },
      {
        name: "Placeholder URL",
        logokey: "https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=T",
        expected: "Should display as-is"
      },
      {
        name: "Empty string",
        logokey: "",
        expected: "Should show fallback"
      },
      {
        name: "Null/undefined",
        logokey: null,
        expected: "Should show fallback"
      }
    ];

    // Test URL construction logic
    const testUrlConstruction = (logokey: string | null) => {
      if (!logokey) return null;
      
      if (logokey.startsWith("data:") || logokey.startsWith("http")) {
        return logokey;
      }
      
      return logokey.startsWith("/")
        ? `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com${logokey}`
        : `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/${logokey}`;
    };

    const results = testLogos.map(test => ({
      ...test,
      constructedUrl: testUrlConstruction(test.logokey as string),
      willDisplay: testUrlConstruction(test.logokey as string) !== null
    }));

    return NextResponse.json({
      success: true,
      testResults: results,
      bucketName: "qrewards-media6367c-dev",
      region: "us-west-1",
      baseUrl: "https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com"
    });
  } catch (error) {
    console.error("Error in logo test:", error);
    return NextResponse.json(
      { error: "Failed to test logo functionality" },
      { status: 500 }
    );
  }
} 