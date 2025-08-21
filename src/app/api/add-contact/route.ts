import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    console.log("Available models:", Object.keys(client.models));
    // TODO: Re-enable Contact model once schema issues are resolved
    // await client.models.Contact.create({
    //   name,
    //   email,
    //   message,
    //   createdAt: new Date().toISOString(),
    // });
    return NextResponse.json({ success: true, message: "Contact temporarily disabled due to schema issues" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save contact" }, { status: 500 });
  }
} 