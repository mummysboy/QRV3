import { NextResponse } from "next/server";

export async function GET() {
  try {
    const testLogos = [
      {
        name: "Golden West Business News Logo",
        url: "https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/logos/Golden-West-Business-News-a7f383ac-a3ae-4243-a467-742827c63f5a.png",
        description: "Existing working logo"
      },
      {
        name: "Chicken Lickin Logo",
        url: "https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/logos/Chicken-Lickin-b6b68692-8ad4-467a-b5ac-94778be250b6.png",
        description: "Another existing logo"
      }
    ];

    const results = [];

    for (const testLogo of testLogos) {
      try {
        const response = await fetch(testLogo.url, { method: 'HEAD' });
        results.push({
          name: testLogo.name,
          url: testLogo.url,
          accessible: response.ok,
          status: response.status,
          statusText: response.statusText,
          description: testLogo.description
        });
      } catch (error) {
        results.push({
          name: testLogo.name,
          url: testLogo.url,
          accessible: false,
          error: error instanceof Error ? error.message : "Unknown error",
          description: testLogo.description
        });
      }
    }

    return NextResponse.json({
      success: true,
      bucketName: "qrewards-media6367c-dev",
      region: "us-west-1",
      testResults: results,
      recommendation: results.some(r => r.accessible) 
        ? "Some URLs are accessible - check your logo keys"
        : "No URLs are accessible - bucket may need public read policy"
    });

  } catch (error) {
    console.error("❌ Logo access test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 