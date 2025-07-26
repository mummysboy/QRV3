import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const dynamoClient = new DynamoDBClient({ region: "us-west-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: "us-west-1" });

const BUSINESS_TABLE = "qrewards-businesses-dev";
const USER_TABLE = "qrewards-users-dev";
const REWARDS_TABLE = "qrewards-rewards-dev";
const CLAIMS_TABLE = "qrewards-claims-dev";
const ANALYTICS_TABLE = "qrewards-analytics-dev";
const S3_BUCKET = "qrewards-media6367c-dev";

export async function DELETE(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    console.log(`🗑️ Starting account deletion for user: ${userEmail}`);

    // Step 1: Get all businesses for this user
    const businessesResponse = await docClient.send(new QueryCommand({
      TableName: BUSINESS_TABLE,
      IndexName: "UserEmailIndex",
      KeyConditionExpression: "userEmail = :userEmail",
      ExpressionAttributeValues: {
        ":userEmail": userEmail
      }
    }));

    const businesses = businessesResponse.Items || [];
    console.log(`📋 Found ${businesses.length} businesses to delete`);

    // Step 2: Delete all rewards for each business
    for (const business of businesses) {
      const rewardsResponse = await docClient.send(new QueryCommand({
        TableName: REWARDS_TABLE,
        KeyConditionExpression: "businessId = :businessId",
        ExpressionAttributeValues: {
          ":businessId": business.id
        }
      }));

      const rewards = rewardsResponse.Items || [];
      console.log(`🎁 Deleting ${rewards.length} rewards for business ${business.id}`);

      // Delete each reward
      for (const reward of rewards) {
        await docClient.send(new DeleteCommand({
          TableName: REWARDS_TABLE,
          Key: {
            cardid: reward.cardid,
            businessId: reward.businessId
          }
        }));
      }

      // Delete claims for this business
      const claimsResponse = await docClient.send(new QueryCommand({
        TableName: CLAIMS_TABLE,
        IndexName: "BusinessIdIndex",
        KeyConditionExpression: "businessId = :businessId",
        ExpressionAttributeValues: {
          ":businessId": business.id
        }
      }));

      const claims = claimsResponse.Items || [];
      console.log(`📝 Deleting ${claims.length} claims for business ${business.id}`);

      for (const claim of claims) {
        await docClient.send(new DeleteCommand({
          TableName: CLAIMS_TABLE,
          Key: {
            id: claim.id,
            businessId: claim.businessId
          }
        }));
      }

      // Delete analytics for this business
      const analyticsResponse = await docClient.send(new QueryCommand({
        TableName: ANALYTICS_TABLE,
        KeyConditionExpression: "businessId = :businessId",
        ExpressionAttributeValues: {
          ":businessId": business.id
        }
      }));

      const analytics = analyticsResponse.Items || [];
      console.log(`📊 Deleting ${analytics.length} analytics records for business ${business.id}`);

      for (const analytic of analytics) {
        await docClient.send(new DeleteCommand({
          TableName: ANALYTICS_TABLE,
          Key: {
            businessId: analytic.businessId,
            date: analytic.date
          }
        }));
      }

      // Delete business logos from S3
      if (business.logo && business.logo.trim() !== '') {
        try {
          let logoKey = business.logo;
          
          // If it's a full URL, extract just the key
          if (business.logo.startsWith('http')) {
            const urlParts = business.logo.split('/');
            if (urlParts.length > 3) {
              logoKey = urlParts.slice(3).join('/');
            }
          }

          if (logoKey.startsWith('logos/')) {
            console.log(`🖼️ Deleting logo: ${logoKey}`);
            await s3Client.send(new DeleteObjectCommand({
              Bucket: S3_BUCKET,
              Key: logoKey
            }));
          }
        } catch (error) {
          console.warn(`⚠️ Failed to delete logo ${business.logo}:`, error);
        }
      }

      // Delete the business
      await docClient.send(new DeleteCommand({
        TableName: BUSINESS_TABLE,
        Key: {
          id: business.id
        }
      }));
    }

    // Step 3: Delete user
    const userResponse = await docClient.send(new QueryCommand({
      TableName: USER_TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": userEmail
      }
    }));

    const users = userResponse.Items || [];
    console.log(`👤 Deleting ${users.length} user records`);

    for (const user of users) {
      await docClient.send(new DeleteCommand({
        TableName: USER_TABLE,
        Key: {
          id: user.id
        }
      }));
    }

    // Step 4: Clear any remaining S3 objects for this user
    try {
      const listResponse = await s3Client.send(new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: `logos/`
      }));

      if (listResponse.Contents) {
        for (const object of listResponse.Contents) {
          if (object.Key && object.Key.includes(userEmail.replace('@', '-').replace('.', '-'))) {
            console.log(`🗑️ Deleting S3 object: ${object.Key}`);
            await s3Client.send(new DeleteObjectCommand({
              Bucket: S3_BUCKET,
              Key: object.Key
            }));
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to clean up S3 objects:`, error);
    }

    console.log(`✅ Account deletion completed for user: ${userEmail}`);

    return NextResponse.json({ 
      success: true, 
      message: "Account and all associated data deleted successfully" 
    });

  } catch (error) {
    console.error("❌ Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
} 