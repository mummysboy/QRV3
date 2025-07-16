import { NextResponse } from "next/server";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export async function POST() {
  try {
    // Add a test card to the database that expires in 2 hours
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    const expirationString = expirationDate.toISOString();
    
    const testCard = {
      cardid: "card1232",
      quantity: 10,
      logokey: "test-logo",
      header: "Starbucks",
      subheader: "Buy one coffee get the second one half off!",
      addressurl: "https://google.com/maps?q=456+Pineapple+Ave",
      addresstext: "123 Brew St, Coffee City, HI",
      expires: expirationString,
    };

    await client.models.Card.create(testCard);
    
    return NextResponse.json({
      success: true,
      message: "Test card added successfully with 2-hour expiration",
      card: testCard,
      expiresIn: "2 hours"
    });
  } catch (error) {
    console.error("Error adding test card:", error);
    return NextResponse.json(
      { error: "Failed to add test card" },
      { status: 500 }
    );
  }
} 