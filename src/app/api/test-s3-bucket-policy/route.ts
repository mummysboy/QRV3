import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import outputs from "../../../../amplify_outputs.json";

const BUCKET_NAME = (outputs as any).storage?.bucket_name || "amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3";
const REGION = (outputs as any).storage?.aws_region || "us-west-1";

export async function GET(request: NextRequest) {
  const logoKey = "logos/PaddysPancakes-039e484b-11c4-4869-9b54-242cd816da44.png";
  const logoUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${logoKey}`;
  
  console.log("🔍 Testing S3 bucket policy for:", logoKey);
  console.log("🔍 Full URL:", logoUrl);
  
  try {
    // Configure S3 client with environment credentials
    const s3ClientConfig: any = {
      region: REGION,
    };
    
    if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
      s3ClientConfig.credentials = {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        ...(process.env.SESSION_TOKEN && { sessionToken: process.env.SESSION_TOKEN }),
      };
      console.log("🔍 Using explicit credentials from environment");
    } else {
      console.log("🔍 No explicit credentials found, using IAM role");
    }
    
    const s3Client = new S3Client(s3ClientConfig);
    
    // Test 1: HeadObject (check if object exists and get metadata)
    console.log("🔍 Testing HeadObject...");
    let headResult = null;
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: logoKey,
      });
      const headResponse = await s3Client.send(headCommand);
      headResult = {
        success: true,
        contentLength: headResponse.ContentLength,
        contentType: headResponse.ContentType,
        lastModified: headResponse.LastModified,
        metadata: headResponse.Metadata,
      };
      console.log("✅ HeadObject successful:", headResult);
    } catch (headError) {
      headResult = {
        success: false,
        error: headError instanceof Error ? headError.message : "Unknown error",
        code: (headError as any).$metadata?.httpStatusCode || "Unknown",
      };
      console.error("❌ HeadObject failed:", headResult);
    }
    
    // Test 2: GetObject (try to actually read the object)
    console.log("🔍 Testing GetObject...");
    let getResult = null;
    try {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: logoKey,
      });
      const getResponse = await s3Client.send(getCommand);
      getResult = {
        success: true,
        contentLength: getResponse.ContentLength,
        contentType: getResponse.ContentType,
        lastModified: getResponse.LastModified,
        body: getResponse.Body ? "Body present" : "No body",
      };
      console.log("✅ GetObject successful:", getResult);
    } catch (getError) {
      getResult = {
        success: false,
        error: getError instanceof Error ? getError.message : "Unknown error",
        code: (getError as any).$metadata?.httpStatusCode || "Unknown",
      };
      console.error("❌ GetObject failed:", getResult);
    }
    
    // Test 3: HTTP public access test
    console.log("🔍 Testing HTTP public access...");
    let httpResult = null;
    try {
      const httpResponse = await fetch(logoUrl);
      httpResult = {
        success: httpResponse.ok,
        status: httpResponse.status,
        statusText: httpResponse.statusText,
        headers: Object.fromEntries(httpResponse.headers.entries()),
      };
      console.log("✅ HTTP access result:", httpResult);
    } catch (httpError) {
      httpResult = {
        success: false,
        error: httpError instanceof Error ? httpError.message : "Unknown error",
      };
      console.error("❌ HTTP access failed:", httpResult);
    }
    
    return NextResponse.json({
      success: true,
      logoKey,
      logoUrl,
      bucketName: BUCKET_NAME,
      region: REGION,
      tests: {
        headObject: headResult,
        getObject: getResult,
        httpAccess: httpResult,
      },
      analysis: {
        s3Accessible: headResult?.success || false,
        publiclyReadable: httpResult?.success || false,
        hasPermissions: getResult?.success || false,
      },
      message: "S3 bucket policy test completed"
    });
    
  } catch (error) {
    console.error("❌ S3 bucket policy test failed:", error);
    return NextResponse.json({
      success: false,
      logoKey,
      logoUrl,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "S3 bucket policy test failed"
    }, { status: 500 });
  }
}
