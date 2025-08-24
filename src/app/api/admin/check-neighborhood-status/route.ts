import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    console.log('🔍 Checking neighborhood status for all businesses...');
    
    const client = generateClient({ authMode: "apiKey" });
    
    // Get all businesses
    const businessesResult = await client.graphql({
      query: `
        query ListAllBusinesses {
          listBusinesses {
            items {
              id
              name
              address
              city
              state
              zipCode
              neighborhood
              status
              createdAt
            }
          }
        }
      `
    });

    const businesses = (businessesResult as { data: { listBusinesses: { items: Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      neighborhood?: string;
      status: string;
      createdAt: string;
    }> } } }).data.listBusinesses.items;

    console.log(`🔍 Found ${businesses.length} total businesses`);

    // Analyze neighborhood status
    const analysis = {
      total: businesses.length,
      withNeighborhood: 0,
      withoutNeighborhood: 0,
      missingAddress: 0,
      businesses: businesses.map(business => ({
        id: business.id,
        name: business.name,
        address: business.address,
        city: business.city,
        state: business.state,
        zipCode: business.zipCode,
        neighborhood: business.neighborhood || '',
        hasNeighborhood: !!(business.neighborhood && business.neighborhood.trim() !== ''),
        missingAddress: !(business.address && business.city && business.state),
        status: business.status,
        createdAt: business.createdAt
      }))
    };

    // Count statistics
    analysis.businesses.forEach(business => {
      if (business.hasNeighborhood) {
        analysis.withNeighborhood++;
      } else if (business.missingAddress) {
        analysis.missingAddress++;
      } else {
        analysis.withoutNeighborhood++;
      }
    });

    console.log('🔍 Neighborhood status analysis:', {
      total: analysis.total,
      withNeighborhood: analysis.withNeighborhood,
      withoutNeighborhood: analysis.withoutNeighborhood,
      missingAddress: analysis.missingAddress
    });

    return NextResponse.json({
      success: true,
      message: `Neighborhood status check completed. ${analysis.withNeighborhood} with neighborhoods, ${analysis.withoutNeighborhood} without, ${analysis.missingAddress} missing addresses.`,
      analysis: analysis
    });

  } catch (error) {
    console.error('❌ Error checking neighborhood status:', error);
    return NextResponse.json(
      { 
        error: "Failed to check neighborhood status", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
