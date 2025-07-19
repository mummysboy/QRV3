import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  category: string;
  status: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  website: string;
  socialMedia: string;
  businessHours: string;
  description: string;
  photos: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Get business information
    const businessResult = await client.graphql({
      query: `
        query GetBusiness($id: String!) {
          getBusiness(id: $id) {
            id
            name
            phone
            email
            zipCode
            category
            status
            logo
            address
            city
            state
            neighborhood
            website
            socialMedia
            businessHours
            description
            photos
            primaryContactEmail
            primaryContactPhone
            createdAt
            updatedAt
            approvedAt
          }
        }
      `,
      variables: {
        id: businessId,
      },
    });

    const business = (businessResult as { data: { getBusiness: Business | null } }).data.getBusiness;

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      business: business,
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business information" },
      { status: 500 }
    );
  }
} 