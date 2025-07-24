import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
});

const BUCKET_NAME = "qrewards-media6367c-dev";

export async function GET() {
  try {
    console.log("🧪 Testing simple S3 upload...");
    
    const testFileName = `simple-test-${Date.now()}.txt`;
    const testContent = "Simple test upload";
    
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await s3Client.send(uploadCommand);
    
    return NextResponse.json({
      success: true,
      message: "Simple upload successful",
      fileName: testFileName,
      bucketName: BUCKET_NAME,
      region: "us-west-1"
    });
  } catch (error) {
    console.error("❌ Simple upload failed:", error);
    
    const errorDetails = {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    };
    
    return NextResponse.json(
      { 
        success: false,
        error: "Simple upload failed",
        details: errorDetails,
        bucketName: BUCKET_NAME
      },
      { status: 500 }
    );
  }
} 