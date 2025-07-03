// File: /src/app/api/get-random-card/route.ts
import { NextResponse } from "next/server";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

// Configure Amplify for server-side usage
Amplify.configure(outputs);
const client = generateClient<Schema>();

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
    
    // ✅ Store the card in local Amplify database for claiming
    if (card && card.cardid) {
      try {
        // Check if card already exists
        const existingCard = await client.models.Card.get({ cardid: card.cardid });
        
        if (!existingCard.data) {
          // Create the card in local database
          await client.models.Card.create({
            cardid: card.cardid,
            quantity: card.quantity || 100,
            logokey: card.logokey,
            header: card.header,
            subheader: card.subheader,
            addressurl: card.addressurl,
            addresstext: card.addresstext,
            expires: card.expires,
          });
          console.log("✅ Card stored in local database:", card.cardid);
        } else {
          console.log("✅ Card already exists in local database:", card.cardid);
        }
      } catch (error) {
        console.error("❌ Failed to store card in local database:", error);
        // Continue even if local storage fails
      }
    }
    
    return NextResponse.json(card);
    
  } catch (err) {
    console.error("Error fetching random card:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
