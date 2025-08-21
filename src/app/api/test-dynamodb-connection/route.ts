import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";

export async function GET() {
  try {
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Test 1: List all tables (basic connectivity)
    console.log("🔍 Testing DynamoDB connectivity...");
    const listTablesCommand = new ListTablesCommand({});
    const tablesResult = await dynamoClient.send(listTablesCommand);
    
    console.log("📋 Available tables:", tablesResult.TableNames);

    // Test 2: Try to scan a specific table (actual data access)
    if (tablesResult.TableNames && tablesResult.TableNames.length > 0) {
      const firstTable = tablesResult.TableNames[0];
      console.log(`🔍 Testing access to table: ${firstTable}`);
      
      const scanCommand = new ScanCommand({
        TableName: firstTable,
        Limit: 1 // Just get 1 item to test access
      });
      
      const scanResult = await dynamoClient.send(scanCommand);
      console.log(`✅ Successfully scanned ${firstTable}, found ${scanResult.Items?.length || 0} items`);
    }

    return NextResponse.json({
      success: true,
      message: "DynamoDB connection test successful",
      tables: tablesResult.TableNames,
      region: process.env.REGION || "us-west-1"
    });

  } catch (error: any) {
    console.error("❌ DynamoDB connection test failed:", error);
    
    // Provide specific error details
    let errorType = "Unknown";
    let errorMessage = error.message || "Unknown error";
    
    if (error.name === "ResourceNotFoundException") {
      errorType = "Table not found";
    } else if (error.name === "AccessDeniedException") {
      errorType = "Access denied - check IAM permissions";
    } else if (error.name === "UnrecognizedClientException") {
      errorType = "Invalid region or endpoint";
    } else if (error.name === "InvalidSignatureException") {
      errorType = "Invalid credentials";
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorType: errorType,
      errorName: error.name,
      region: process.env.REGION || "us-west-1"
    }, { status: 500 });
  }
}
