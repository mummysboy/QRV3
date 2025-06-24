// /src/app/api/redeem-reward/route.ts
import { NextResponse } from "next/server";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-west-1" }); // match your region

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const command = new DeleteItemCommand({
    TableName: "claimed_rewards",
    Key: {
      id: { S: id },
    },
  });

  try {
    await dynamo.send(command);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete reward:", err);
    return NextResponse.json(
      { error: "Failed to delete reward" },
      { status: 500 }
    );
  }
}
