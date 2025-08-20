import { NextResponse } from "next/server";
import { DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export async function POST(req: Request) {
  try {
    const { cardid } = await req.json();
    
    if (!cardid) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    console.log("🔍 Debug: Looking for card with ID:", cardid);

    // Create DynamoDB client
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Try to get the specific card
    try {
      const getCommand = new GetItemCommand({
        TableName: "Card-7cdlttoiifewxgyh7sodc6czx4-NONE",
        Key: marshall({ cardid }),
      });
      
      const cardResponse = await dynamoClient.send(getCommand);
      
      if (cardResponse.Item) {
        const card = unmarshall(cardResponse.Item);
        console.log("✅ Debug: Card found:", card);
        return NextResponse.json({
          success: true,
          message: "Card found",
          card,
          lookupMethod: "GetItem"
        });
      } else {
        console.log("❌ Debug: Card not found with GetItem");
        
        // If not found, let's scan the table to see what's there
        const scanCommand = new ScanCommand({
          TableName: "Card-7cdlttoiifewxgyh7sodc6czx4-NONE",
          Limit: 10
        });
        
        const scanResult = await dynamoClient.send(scanCommand);
        const cards = scanResult.Items?.map(item => unmarshall(item)) || [];
        
        console.log("🔍 Debug: Sample cards in table:", cards.map(c => ({ cardid: c.cardid, header: c.header })));
        
        return NextResponse.json({
          success: false,
          message: "Card not found with GetItem",
          requestedCardId: cardid,
          sampleCards: cards.map(c => ({ cardid: c.cardid, header: c.header })),
          lookupMethod: "GetItem + Scan"
        });
      }
    } catch (error) {
      console.error("❌ Debug: Error during lookup:", error);
      return NextResponse.json({
        success: false,
        message: "Error during lookup",
        error: error instanceof Error ? error.message : "Unknown error",
        lookupMethod: "Error"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("❌ Debug: Request parsing error:", error);
    return NextResponse.json({
      success: false,
      message: "Request parsing error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
