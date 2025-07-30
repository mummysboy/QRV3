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

    console.log('🔧 Admin business update: Address change detection:', {
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
      console.log('🔧 Admin business update: Detecting neighborhood...', {
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
          console.log('🔧 Admin business update: Detected neighborhood:', neighborhood);
        } else {
          console.error('🔧 Admin business update: Failed to detect neighborhood');
        }
      } catch (error) {
        console.error('🔧 Admin business update: Error detecting neighborhood:', error);
      }
    } else {
      console.log('🔧 Admin business update: No neighborhood detection needed, keeping existing neighborhood:', neighborhood);
    }

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
          ...(shouldDetectNeighborhood && { neighborhood }), // Update neighborhood if detected
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
      neighborhood?: string;
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