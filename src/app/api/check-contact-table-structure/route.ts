import { NextResponse } from "next/server";
import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

export async function GET() {
  try {
    console.log("🔍 Checking Contact table structure...");
    
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    const tableName = "Contact-7cdlttoiifewxgyh7sodc6czx4-NONE";
    
    const describeCommand = new DescribeTableCommand({ TableName: tableName });
    const result = await dynamoClient.send(describeCommand);
    
    const table = result.Table;
    
    return NextResponse.json({
      success: true,
      message: "Contact table structure retrieved",
      table: {
        name: table?.TableName,
        status: table?.TableStatus,
        itemCount: table?.ItemCount,
        tableArn: table?.TableArn,
        keySchema: table?.KeySchema,
        attributeDefinitions: table?.AttributeDefinitions,
        billingMode: table?.BillingMode,
        provisionedThroughput: table?.ProvisionedThroughput,
        globalSecondaryIndexes: table?.GlobalSecondaryIndexes,
        localSecondaryIndexes: table?.LocalSecondaryIndexes,
        streamSpecification: table?.StreamSpecification,
        latestStreamLabel: table?.LatestStreamLabel,
        latestStreamArn: table?.LatestStreamArn,
        restoreSummary: table?.RestoreSummary,
        sseDescription: table?.SSEDescription,
        archivalSummary: table?.ArchivalSummary,
        tableClassSummary: table?.TableClassSummary,
        deletionProtectionEnabled: table?.DeletionProtectionEnabled
      }
    });
    
  } catch (error: any) {
    console.error("❌ Failed to get table structure:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.name
    }, { status: 500 });
  }
}
