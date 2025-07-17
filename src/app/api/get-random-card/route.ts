// File: /src/app/api/get-random-card/route.ts
import { NextResponse } from "next/server";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export async function GET() {
  try {
    const res = await fetch(
      "https://8r3ew76gj6.execute-api.us-west-1.amazonaws.com/dev/get-random-card"
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch card" },
        { status: res.status }
      );
    }

    // ✅ In /api/get-random-card/route.ts
    const data = await res.json();
    console.log("🔍 Raw AWS API response:", JSON.stringify(data, null, 2));
    
    let card = data.Item ?? data;
    
    // Check if the response is wrapped in statusCode/headers/body format
    if (card && card.statusCode && card.body) {
      console.log("🔧 Extracting card data from response body");
      card = typeof card.body === 'string' ? JSON.parse(card.body) : card.body;
    }
    
    // Check if the data is in DynamoDB format and needs unmarshalling
    if (card && typeof card === 'object' && Object.values(card).some((value: unknown) => 
      value && typeof value === 'object' && value !== null && 
      ('S' in value || 'N' in value || 'B' in value)
    )) {
      console.log("🔧 Unmarshalling DynamoDB format data");
      card = unmarshall(card);
    }
    
    console.log("🔍 Processed card data:", JSON.stringify(card, null, 2));
    
    return NextResponse.json(card);
    
  } catch (err) {
    console.error("Error fetching random card:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
