import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export async function POST(req: Request) {
  try {
    console.log("🧪 Testing real-world Contact table operations...");
    
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    const tableName = "Contact-7cdlttoiifewxgyh7sodc6czx4-NONE";
    const results: any = {};

    // Test 1: Create a contact (like your contact form would)
    try {
      console.log("📝 Creating a test contact...");
      const contactData = {
        id: `contact-${Date.now()}`,
        name: "John Doe",
        email: "john.doe@example.com",
        message: "This is a test contact message",
        createdAt: new Date().toISOString()
      };
      
      const putCommand = new PutItemCommand({
        TableName: tableName,
        Item: marshall(contactData)
      });
      
      await dynamoClient.send(putCommand);
      results.createContact = {
        success: true,
        message: "Contact created successfully",
        contactId: contactData.id
      };
      console.log("✅ Contact created with ID:", contactData.id);
      
      // Test 2: Retrieve the contact we just created
      try {
        console.log("🔍 Retrieving the created contact...");
        const getCommand = new GetItemCommand({
          TableName: tableName,
          Key: marshall({ id: contactData.id })
        });
        
        const getResult = await dynamoClient.send(getCommand);
        if (getResult.Item) {
          const retrievedContact = unmarshall(getResult.Item);
          results.retrieveContact = {
            success: true,
            message: "Contact retrieved successfully",
            contact: retrievedContact
          };
          console.log("✅ Contact retrieved:", retrievedContact);
        } else {
          results.retrieveContact = {
            success: false,
            message: "Contact not found after creation"
          };
          console.log("❌ Contact not found after creation");
        }
      } catch (getError: any) {
        results.retrieveContact = {
          success: false,
          error: getError.message,
          errorCode: getError.name
        };
        console.log("❌ GetItem failed:", getError.message);
      }
      
      // Test 3: Scan for all contacts
      try {
        console.log("🔍 Scanning for all contacts...");
        const scanCommand = new ScanCommand({
          TableName: tableName,
          Limit: 10
        });
        
        const scanResult = await dynamoClient.send(scanCommand);
        results.scanContacts = {
          success: true,
          message: "Scan successful",
          itemsFound: scanResult.Items?.length || 0,
          items: scanResult.Items?.map(item => unmarshall(item)) || []
        };
        console.log("✅ Scan successful, found", scanResult.Items?.length || 0, "items");
      } catch (scanError: any) {
        results.scanContacts = {
          success: false,
          error: scanError.message,
          errorCode: scanError.name
        };
        console.log("❌ Scan failed:", scanError.message);
      }
      
      // Clean up: Delete the test contact
      try {
        console.log("🧹 Cleaning up test contact...");
        const { DeleteItemCommand } = await import("@aws-sdk/client-dynamodb");
        const deleteCommand = new DeleteItemCommand({
          TableName: tableName,
          Key: marshall({ id: contactData.id })
        });
        await dynamoClient.send(deleteCommand);
        results.cleanup = {
          success: true,
          message: "Test contact cleaned up successfully"
        };
        console.log("✅ Test contact cleaned up");
      } catch (cleanupError: any) {
        results.cleanup = {
          success: false,
          error: cleanupError.message,
          errorCode: cleanupError.name
        };
        console.log("⚠️ Cleanup failed:", cleanupError.message);
      }
      
    } catch (error: any) {
      results.createContact = {
        success: false,
        error: error.message,
        errorCode: error.name
      };
      console.log("❌ Create contact failed:", error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Real-world Contact table tests completed",
      results,
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    });
    
  } catch (error: any) {
    console.error("❌ Real-world test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.name
    }, { status: 500 });
  }
}
