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

    const client = generateClient({ authMode: "apiKey" });

    // Get current business data to check if address has changed
    const currentBusinessResult = await client.graphql({
      query: `
        query GetBusiness($id: String!) {
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

    const currentBusiness = (currentBusinessResult as { data: { getBusiness?: { 
      id: string; 
      name: string; 
      address: string; 
      city: string; 
      state: string; 
      zipCode: string; 
      neighborhood: string; 
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

    // Detect neighborhood if address has changed or if neighborhood is empty
    let neighborhood = currentBusiness.neighborhood || '';
    const shouldDetectNeighborhood = addressChanged || !neighborhood;
    
    if (shouldDetectNeighborhood) {
      console.log('🔧 Business update: Detecting neighborhood...', {
        reason: addressChanged ? 'address changed' : 'neighborhood empty'
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
    } else {
      console.log('🔧 Business update: No neighborhood detection needed, keeping existing neighborhood:', neighborhood);
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
      ...(logo !== undefined && { logo }),
      ...(photos !== undefined && { photos }),
      ...(primaryContactEmail !== undefined && { primaryContactEmail }),
      ...(primaryContactPhone !== undefined && { primaryContactPhone }),
      ...(shouldDetectNeighborhood && { neighborhood }), // Update neighborhood if detected
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
        input: updateInput,
      },
    });

    const updatedBusiness = (updateResult as { data: { updateBusiness: Business } }).data.updateBusiness;
    
    console.log('🔧 Business update: Successfully updated business:', updatedBusiness);

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
      neighborhoodDetected: addressChanged ? neighborhood : null,
    });
  } catch (error) {
    console.error('🔧 Business update: Error updating business:', error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
} 