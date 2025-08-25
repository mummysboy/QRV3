import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import { normalizeLogoUrl } from "../../../../utils/logoUtils";

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

    const client = generateClient({ authMode: "apiKey" });

    // Get current business data to check if address has changed
    console.log('🔧 Business update: Fetching current business data for ID:', businessId);
    let currentBusinessResult;
    try {
      currentBusinessResult = await client.graphql({
        query: `
          query GetBusiness($id: ID!) {
            getBusiness(id: $id) {
              id
              name
              address
              city
              state
              zipCode
              neighborhood
            }
          }
        `,
        variables: { id: businessId },
      });
      console.log('🔧 Business update: GraphQL response:', JSON.stringify(currentBusinessResult, null, 2));
    } catch (error) {
      console.error('🔧 Business update: GraphQL error:', error);
      return NextResponse.json(
        { error: "Failed to fetch business data", details: error },
        { status: 500 }
      );
    }

    const currentBusiness = (currentBusinessResult as { data: { getBusiness?: { 
      id: string; 
      name: string; 
      address: string; 
      city: string; 
      state: string; 
      zipCode: string; 
      // Note: neighborhood field not available in current schema
    } } }).data.getBusiness;

    if (!currentBusiness) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Check if address has changed
    const addressChanged = (
      (address !== undefined && address !== currentBusiness.address) ||
      (city !== undefined && city !== currentBusiness.city) ||
      (state !== undefined && state !== currentBusiness.state) ||
      (zipCode !== undefined && zipCode !== currentBusiness.zipCode)
    );

    console.log('🔧 Business update: Address change detection:', {
      addressChanged,
      currentAddress: currentBusiness.address,
      newAddress: address,
      currentCity: currentBusiness.city,
      newCity: city,
      currentState: currentBusiness.state,
      newState: state,
      currentZipCode: currentBusiness.zipCode,
      newZipCode: zipCode
    });

    // Always detect neighborhood when address changes or if neighborhood is empty
    let neighborhood = '';
    const shouldDetectNeighborhood = addressChanged || true; // Always detect for now
    
    if (shouldDetectNeighborhood) {
      console.log('🔧 Business update: Detecting neighborhood...', {
        reason: addressChanged ? 'address changed' : 'always detecting'
      });
      try {
        const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/detect-neighborhood`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: name || currentBusiness.name,
            address: `${address || currentBusiness.address}, ${city || currentBusiness.city}, ${state || currentBusiness.state} ${zipCode || currentBusiness.zipCode}`
          })
        });
        
        if (detectRes.ok) {
          const detectData = await detectRes.json();
          neighborhood = detectData.neighborhood || '';
          console.log('🔧 Business update: Detected neighborhood:', neighborhood);
        } else {
          console.error('🔧 Business update: Failed to detect neighborhood');
        }
      } catch (error) {
        console.error('🔧 Business update: Error detecting neighborhood:', error);
      }
    }

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
        ...(logo !== undefined && { logo: normalizeLogoUrl(logo) }),
        ...(photos !== undefined && { photos }),
      ...(primaryContactEmail !== undefined && { primaryContactEmail }),
      ...(primaryContactPhone !== undefined && { primaryContactPhone }),
      // Note: neighborhood field not available in current schema yet, but we'll detect it
      // ...(shouldDetectNeighborhood && { neighborhood }), // Update neighborhood if detected
      updatedAt: new Date().toISOString(),
      // Temporarily remove profileComplete until schema is deployed
      // ...(profileComplete !== undefined && { profileComplete }),
    };

    console.log('🔧 Business update: Update input:', updateInput);

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
        input: updateInput,
      },
    });

    const updatedBusiness = (updateResult as { data: { updateBusiness: Business } }).data.updateBusiness;
    
    console.log('🔧 Business update: Successfully updated business:', updatedBusiness);

    // If logo was updated, also update all existing cards to use the new logo
    if (logo !== undefined && logo !== null) {
      try {
        console.log('🔧 Business update: Logo changed, updating existing cards...');
        
        // Get all cards for this business
        const cardsResult = await client.graphql({
          query: `
            query GetBusinessCards($businessId: String!) {
              listCards(filter: {
                businessId: { eq: $businessId }
              }) {
                items {
                  cardid
                  businessId
                }
              }
            }
          `,
          variables: { businessId },
        });

        const cards = (cardsResult as { data: { listCards: { items: Array<{ cardid: string; businessId: string }> } } }).data.listCards.items;
        
        if (cards.length > 0) {
          console.log(`🔧 Business update: Found ${cards.length} cards to update`);
          
          // Update each card with the new logo
          for (const card of cards) {
            try {
              await client.graphql({
                query: `
                  mutation UpdateCard($input: UpdateCardInput!) {
                    updateCard(input: $input) {
                      cardid
                      logokey
                    }
                  }
                `,
                variables: {
                  input: {
                    cardid: card.cardid,
                    logokey: normalizeLogoUrl(logo), // Use the normalized logo URL
                  },
                },
              });
              console.log(`🔧 Business update: Updated card ${card.cardid} with new logo`);
            } catch (cardUpdateError) {
              console.error(`🔧 Business update: Failed to update card ${card.cardid}:`, cardUpdateError);
              // Continue updating other cards even if one fails
            }
          }
          
          console.log('🔧 Business update: Finished updating all cards with new logo');
        } else {
          console.log('🔧 Business update: No existing cards found to update');
        }
      } catch (cardsUpdateError) {
        console.error('🔧 Business update: Error updating existing cards:', cardsUpdateError);
        // Don't fail the business update if card updates fail
      }
    }

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
      // Note: neighborhood detection temporarily disabled
      // neighborhoodDetected: addressChanged ? neighborhood : null,
    });
  } catch (error) {
    console.error('🔧 Business update: Error updating business:', error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
} 