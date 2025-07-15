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
  website: string;
  socialMedia: string;
  businessHours: string;
  description: string;
  photos: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  profileComplete?: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      name,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      website,
      socialMedia,
      businessHours,
      description,
      logo,
      photos,
      primaryContactEmail,
      primaryContactPhone,
      // profileComplete, // Temporarily commented out
    } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Update business information
    const updateResult = await client.graphql({
      query: `
        mutation UpdateBusiness($input: UpdateBusinessInput!) {
          updateBusiness(input: $input) {
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
        input: {
          id: businessId,
          ...(name && { name }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode && { zipCode }),
          ...(website !== undefined && { website }),
          ...(socialMedia !== undefined && { socialMedia }),
          ...(businessHours !== undefined && { businessHours }),
          ...(description !== undefined && { description }),
          ...(logo !== undefined && { logo }),
          ...(photos !== undefined && { photos }),
          ...(primaryContactEmail !== undefined && { primaryContactEmail }),
          ...(primaryContactPhone !== undefined && { primaryContactPhone }),
          // Temporarily remove profileComplete until schema is deployed
          // ...(profileComplete !== undefined && { profileComplete }),
        },
      },
    });

    const updatedBusiness = (updateResult as { data: { updateBusiness: Business } }).data.updateBusiness;

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Failed to update business information" },
      { status: 500 }
    );
  }
} 