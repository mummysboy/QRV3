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
    console.log('🔧 Business update: Received request body:', body);
    
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

    console.log('🔧 Business update: Extracted logo field:', logo);
    console.log('🔧 Business update: Business ID:', businessId);

    if (!businessId) {
      console.error('❌ Business update: No business ID provided');
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Build update input
    const updateInput = {
      id: businessId,
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zipCode !== undefined && { zipCode }),
      ...(website !== undefined && { website }),
      ...(socialMedia !== undefined && { socialMedia }),
      ...(businessHours !== undefined && { businessHours }),
      ...(description !== undefined && { description }),
      ...(logo !== undefined && { logo }),
      ...(photos !== undefined && { photos }),
      ...(primaryContactEmail !== undefined && { primaryContactEmail }),
      ...(primaryContactPhone !== undefined && { primaryContactPhone }),
      updatedAt: new Date().toISOString(),
      // Temporarily remove profileComplete until schema is deployed
      // ...(profileComplete !== undefined && { profileComplete }),
    };

    console.log('🔧 Business update: Update input:', updateInput);

    // Update business information (neighborhood is set during approval)
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
        input: updateInput,
      },
    });

    const updatedBusiness = (updateResult as { data: { updateBusiness: Business } }).data.updateBusiness;
    console.log('✅ Business update: Successfully updated business:', {
      id: updatedBusiness.id,
      name: updatedBusiness.name,
      logo: updatedBusiness.logo
    });

    // If logo was updated, update all rewards (cards) for this business to use the new logo
    if (logo !== undefined) {
      try {
        // Fetch all cards for this business
        const cardsResult = await client.graphql({
          query: `
            query GetBusinessCards($businessId: String!) {
              listCards(filter: { businessId: { eq: $businessId } }) {
                items { cardid }
              }
            }
          `,
          variables: { businessId },
        });
        const cards = (cardsResult as { data: { listCards: { items: Array<{ cardid: string }> } } }).data.listCards.items;
        // Update each card's logokey
        for (const card of cards) {
          await client.graphql({
            query: `
              mutation UpdateCard($input: UpdateCardInput!) {
                updateCard(input: $input) { cardid logokey }
              }
            `,
            variables: { input: { cardid: card.cardid, logokey: logo } },
          });
        }
        console.log(`✅ Updated logokey for ${cards.length} rewards to new logo.`);
      } catch (err) {
        console.error('❌ Failed to update rewards with new logo:', err);
      }
    }

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("❌ Business update: Error updating business:", error);
    return NextResponse.json(
      { error: "Failed to update business information" },
      { status: 500 }
    );
  }
} 