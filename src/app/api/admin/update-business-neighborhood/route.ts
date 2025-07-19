import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    const { businessId, neighborhood } = await request.json();

    if (!businessId || !neighborhood) {
      return NextResponse.json(
        { error: "Business ID and neighborhood are required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Update the business with the neighborhood
    const updateResult = await client.graphql({
      query: `
        mutation UpdateBusiness($input: UpdateBusinessInput!) {
          updateBusiness(input: $input) {
            id
            name
            address
            city
            state
            neighborhood
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          id: businessId,
          neighborhood: neighborhood,
        },
      },
    });

    const updatedBusiness = (updateResult as { data: { updateBusiness: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      neighborhood: string;
      updatedAt: string;
    } } }).data.updateBusiness;

    console.log(`Updated business ${businessId} with neighborhood: ${neighborhood}`);

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Error updating business neighborhood:", error);
    return NextResponse.json(
      { error: "Failed to update business neighborhood" },
      { status: 500 }
    );
  }
} 