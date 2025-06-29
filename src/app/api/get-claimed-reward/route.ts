// /src/app/api/get-claimed-reward/route.ts
import { NextResponse } from "next/server";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-west-1" }); // use correct region

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const command = new GetItemCommand({
    TableName: "claimed_rewards",
    Key: { id: { S: id } },
  });

  try {
    const result = await dynamo.send(command);
    if (!result.Item) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const data = unmarshall(result.Item);
    return NextResponse.json(data);
  } catch (error) {
    console.error("DynamoDB error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
