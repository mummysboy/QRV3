// src/lib/aws-logic.ts
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-west-1" });

export async function decrementQuantity(cardid: string) {
  const command = new UpdateItemCommand({
    TableName: "cards",
    Key: marshall({ cardid }),
    UpdateExpression: "SET quantity = quantity - :decr",
    ConditionExpression: "quantity > :zero",
    ExpressionAttributeValues: marshall({
      ":decr": 1,
      ":zero": 0,
    }),
    ReturnValues: "UPDATED_NEW",
  });

  const result = await dynamo.send(command);
  console.log("✅ Quantity decremented:", result);
  return result;
}