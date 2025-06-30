import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

// Configure Amplify for server-side usage with the actual generated outputs
Amplify.configure(outputs);

const client = generateClient<Schema>();

export async function POST() {
  try {
    // Add a test card to the database
    const testCard = {
      cardid: "card1232",
      quantity: 10,
      logokey: "test-logo",
      header: "Starbucks",
      subheader: "Buy one coffee get the second one half off!",
      addressurl: "https://google.com/maps?q=456+Pineapple+Ave",
      addresstext: "123 Brew St, Coffee City, HI",
      expires: "2026-05-11",
    };

    await client.models.Card.create(testCard);
    
    return NextResponse.json({
      success: true,
      message: "Test card added successfully",
      card: testCard
    });
  } catch (error) {
    console.error("Error adding test card:", error);
    return NextResponse.json(
      { error: "Failed to add test card" },
      { status: 500 }
    );
  }
} 