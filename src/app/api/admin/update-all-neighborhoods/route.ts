import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting neighborhood update for all businesses...');
    
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
    }> } } }).data.listBusinesses.items;

    console.log(`🔧 Found ${businesses.length} total businesses`);

    const results = {
      total: businesses.length,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{
        id: string;
        name: string;
        oldNeighborhood?: string;
        newNeighborhood: string;
        status: 'updated' | 'skipped' | 'error';
        error?: string;
      }>
    };

    // Process each business
    for (const business of businesses) {
      try {
        console.log(`🔧 Processing business: ${business.name} (${business.id})`);
        
        // Skip if already has neighborhood
        if (business.neighborhood && business.neighborhood.trim() !== '') {
          console.log(`  ✅ Already has neighborhood: ${business.neighborhood}`);
          results.details.push({
            id: business.id,
            name: business.name,
            oldNeighborhood: business.neighborhood,
            newNeighborhood: business.neighborhood,
            status: 'skipped'
          });
          results.skipped++;
          continue;
        }

        // Skip if missing address information
        if (!business.address || !business.city || !business.state) {
          console.log(`  ⚠️ Missing address information, skipping`);
          results.details.push({
            id: business.id,
            name: business.name,
            oldNeighborhood: business.neighborhood,
            newNeighborhood: '',
            status: 'skipped'
          });
          results.skipped++;
          continue;
        }

        // Detect neighborhood
        console.log(`  🔍 Detecting neighborhood for: ${business.address}, ${business.city}, ${business.state}`);
        const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/detect-neighborhood`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: business.name,
            address: `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`
          })
        });

        if (!detectRes.ok) {
          throw new Error(`Failed to detect neighborhood: ${detectRes.status}`);
        }

        const detectData = await detectRes.json();
        const newNeighborhood = detectData.neighborhood || '';
        
        if (!newNeighborhood) {
          throw new Error('No neighborhood detected');
        }

        console.log(`  ✅ Detected neighborhood: ${newNeighborhood}`);

        // Update business with new neighborhood
        const updateResult = await client.graphql({
          query: `
            mutation UpdateBusiness($input: UpdateBusinessInput!) {
              updateBusiness(input: $input) {
                id
                name
                neighborhood
                updatedAt
              }
            }
          `,
          variables: {
            input: {
              id: business.id,
              neighborhood: newNeighborhood,
              updatedAt: new Date().toISOString()
            }
          }
        });

        const updatedBusiness = (updateResult as { data: { updateBusiness: { id: string; name: string; neighborhood: string; updatedAt: string } } }).data.updateBusiness;
        
        console.log(`  ✅ Successfully updated business with neighborhood: ${updatedBusiness.neighborhood}`);
        
        results.details.push({
          id: business.id,
          name: business.name,
          oldNeighborhood: business.neighborhood,
          newNeighborhood: newNeighborhood,
          status: 'updated'
        });
        results.updated++;

        // Add a small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`  ❌ Error processing business ${business.name}:`, error);
        results.details.push({
          id: business.id,
          name: business.name,
          oldNeighborhood: business.neighborhood,
          newNeighborhood: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        results.errors++;
      }
    }

    console.log('🔧 Neighborhood update completed:', results);

    return NextResponse.json({
      success: true,
      message: `Neighborhood update completed. ${results.updated} updated, ${results.skipped} skipped, ${results.errors} errors.`,
      results: results
    });

  } catch (error) {
    console.error('❌ Error in neighborhood update:', error);
    return NextResponse.json(
      { 
        error: "Failed to update neighborhoods", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 