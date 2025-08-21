import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    const { cardid, businessId } = await request.json();

    if (!cardid) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient({ authMode: "apiKey" });

    // Get IP address and user agent
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create card view record
    const viewData = {
      cardid,
      businessId: businessId || "",
      viewed_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    };

    await client.graphql({
      query: `
        mutation CreateCardView($input: CreateCardViewInput!) {
          createCardView(input: $input) {
            id
            cardid
            businessId
            viewed_at
            ip_address
            user_agent
          }
        }
      `,
      variables: {
        input: viewData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Card view tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking card view:", error);
    return NextResponse.json(
      { error: "Failed to track card view" },
      { status: 500 }
    );
  }
} 