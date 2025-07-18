import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface UpdateBusinessData {
  businessId: string;
  name: string;
  phone?: string;
  email: string;
  zipCode?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      name,
      phone,
      email,
      zipCode,
      category,
      address,
      city,
      state,
      website,
      description
    }: UpdateBusinessData = body;

    // Validate required fields
    if (!businessId || !name || !email) {
      return NextResponse.json(
        { error: "Business ID, name, and email are required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Update business information
    const result = await client.graphql({
      query: `
        mutation UpdateBusiness($input: UpdateBusinessInput!) {
          updateBusiness(input: $input) {
            id
            name
            phone
            email
            zipCode
            category
            address
            city
            state
            website
            description
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          id: businessId,
          name,
          phone: phone || null,
          email,
          zipCode: zipCode || null,
          category: category || null,
          address: address || null,
          city: city || null,
          state: state || null,
          website: website || null,
          description: description || null,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const updatedBusiness = (result as { data: { updateBusiness: {
      id: string;
      name: string;
      phone?: string;
      email: string;
      zipCode?: string;
      category?: string;
      address?: string;
      city?: string;
      state?: string;
      website?: string;
      description?: string;
      updatedAt: string;
    } } }).data.updateBusiness;

    return NextResponse.json(
      { 
        success: true, 
        message: "Business updated successfully",
        business: updatedBusiness
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
} 