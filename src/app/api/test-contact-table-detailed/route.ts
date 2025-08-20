import { NextResponse } from "next/server";
import { 
  DynamoDBClient, 
  ScanCommand, 
  GetItemCommand, 
  PutItemCommand, 
  UpdateItemCommand,
  DeleteItemCommand,
  DescribeTableCommand
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

export async function GET() {
  try {
    console.log("🧪 Testing detailed Contact table access...");
    
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    const tableName = "Contact-7cdlttoiifewxgyh7sodc6czx4-NONE";
    const results: any = {};

    // Test 1: Describe Table
    try {
      console.log("📋 Testing DescribeTable...");
      const describeCommand = new DescribeTableCommand({ TableName: tableName });
      const describeResult = await dynamoClient.send(describeCommand);
      results.describeTable = {
        success: true,
        tableStatus: describeResult.Table?.TableStatus,
        itemCount: describeResult.Table?.ItemCount,
        tableArn: describeResult.Table?.TableArn
      };
      console.log("✅ DescribeTable successful");
    } catch (error: any) {
      results.describeTable = {
        success: false,
        error: error.message,
        errorCode: error.name
      };
      console.log("❌ DescribeTable failed:", error.message);
    }

    // Test 2: Scan Table
    try {
      console.log("🔍 Testing Scan...");
      const scanCommand = new ScanCommand({ 
        TableName: tableName, 
        Limit: 5 
      });
      const scanResult = await dynamoClient.send(scanCommand);
      results.scan = {
        success: true,
        itemsFound: scanResult.Items?.length || 0,
        sampleItems: scanResult.Items?.slice(0, 2) || []
      };
      console.log("✅ Scan successful");
    } catch (error: any) {
      results.scan = {
        success: false,
        error: error.message,
        errorCode: error.name
      };
      console.log("❌ Scan failed:", error.message);
    }

    // Test 3: Put Item (Write)
    try {
      console.log("✏️ Testing PutItem...");
      const testItem = {
        id: `test-${Date.now()}`,
        name: "Test User",
        email: "test@example.com",
        message: "Test message",
        createdAt: new Date().toISOString()
      };
      
      const putCommand = new PutItemCommand({
        TableName: tableName,
        Item: marshall(testItem)
      });
      
      await dynamoClient.send(putCommand);
      results.putItem = {
        success: true,
        message: "Test item created successfully"
      };
      console.log("✅ PutItem successful");
      
      // Clean up: Delete the test item
      try {
        const deleteCommand = new DeleteItemCommand({
          TableName: tableName,
          Key: marshall({ id: testItem.id })
        });
        await dynamoClient.send(deleteCommand);
        console.log("🧹 Test item cleaned up");
      } catch (cleanupError) {
        console.log("⚠️ Cleanup failed:", cleanupError);
      }
      
    } catch (error: any) {
      results.putItem = {
        success: false,
        error: error.message,
        errorCode: error.name
      };
      console.log("❌ PutItem failed:", error.message);
    }

    // Test 4: Update Item
    try {
      console.log("🔄 Testing UpdateItem...");
      const updateCommand = new UpdateItemCommand({
        TableName: tableName,
        Key: marshall({ id: "non-existent-id" }),
        UpdateExpression: "SET testField = :val",
        ExpressionAttributeValues: marshall({
          ":val": "test value"
        }),
        ConditionExpression: "attribute_exists(id)"
      });
      
      await dynamoClient.send(updateCommand);
      results.updateItem = {
        success: true,
        message: "UpdateItem successful (though no item was updated due to condition)"
      };
      console.log("✅ UpdateItem successful");
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        results.updateItem = {
          success: true,
          message: "UpdateItem successful (condition check failed as expected)"
        };
        console.log("✅ UpdateItem successful (condition check failed as expected)");
      } else {
        results.updateItem = {
          success: false,
          error: error.message,
          errorCode: error.name
        };
        console.log("❌ UpdateItem failed:", error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Detailed Contact table tests completed",
      results,
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Detailed test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.name,
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    }, { status: 500 });
  }
}
