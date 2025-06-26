// lib/aws.ts

import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

// Do NOT use `AWS.config.update()` — let Lambda assume the role
const dynamo = new DynamoDBClient({ region: "us-west-1" });

export async function decrementCardQuantity(cardid: string) {
  console.log("➡️ Attempting to decrement card:", cardid);
  const params = {
    TableName: "cards",
    Key: marshall({ cardid }),
    UpdateExpression: "SET quantity = quantity - :one",
    ConditionExpression: "quantity > :zero",
    ExpressionAttributeValues: marshall({
      ":one": 1,
      ":zero": 0,
    }),
    ReturnValues: "UPDATED_NEW" as const,
  };

  try {
    const command = new UpdateItemCommand(params);
    const result = await dynamo.send(command);
    console.log("✅ Quantity decremented:", result);
    return result;
  } catch (err) {
    console.error("❌ Failed to decrement quantity:", err);
    throw err;
  }
}

export async function logClaimedReward(data: Record<string, unknown>) {
  try {
    console.log("📝 Logging claimed reward:", JSON.stringify(data, null, 2));
    const command = new PutItemCommand({
      TableName: "claimed_rewards",
      Item: marshall(data),
    });
    const result = await dynamo.send(command);
    console.log("✅ Successfully logged claimed reward:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to log claimed reward:", error);
    throw error;
  }
}
