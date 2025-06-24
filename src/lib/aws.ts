import AWS from "aws-sdk";
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

// ✅ Set the region (replace if yours is different)
AWS.config.update({
  region: "us-west-1", // or whatever region your table is in
});



export const dynamo = new DynamoDBClient({
  region: "us-west-1",
});

export async function decrementCardQuantity(cardid: string) {
  console.log("➡️ Attempting to decrement card:", cardid);
  const params = {
    TableName: "qrewards-card-table-dev",
    Key: marshall({ cardid }),
    UpdateExpression: "SET quantity = quantity - :one",
    ConditionExpression: "quantity > :zero",
    ExpressionAttributeValues: marshall({
      ":one": 1,
      ":zero": 0,
    }),
    ReturnValues: "UPDATED_NEW",
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
  const command = new PutItemCommand({
    TableName: "claimed_rewards",
    Item: marshall(data),
  });
  await dynamo.send(command);
}

