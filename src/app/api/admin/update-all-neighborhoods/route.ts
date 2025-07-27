import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface UpdateDetail {
  id: string;
  name: string;
  status: 'updated' | 'skipped' | 'error';
  neighborhood?: string;
  reason?: string;
  error?: string;
}

export async function POST() {
  try {
    const client = generateClient();

    // Get all businesses
    console.log('🔧 Starting neighborhood update for all businesses...');
    
    const businessesResult = await client.graphql({
      query: `
        query ListBusinesses {
          listBusinesses {
            items {
              id
              name
              address
              city
              state
              zipCode
              neighborhood
            }
          }
        }
      `
    });

    // Handle the GraphQL result properly
    if ('data' in businessesResult) {
      const businesses = businessesResult.data.listBusinesses.items;
      console.log(`🔧 Found ${businesses.length} businesses to update`);

      const results = {
        total: businesses.length,
        updated: 0,
        errors: 0,
        details: [] as UpdateDetail[]
      };

      // Process each business
      for (const business of businesses) {
        try {
          console.log(`🔧 Processing business: ${business.name} (${business.id})`);
          
          // Skip if already has neighborhood
          if (business.neighborhood && business.neighborhood.trim() !== '') {
            console.log(`🔧 Skipping ${business.name} - already has neighborhood: ${business.neighborhood}`);
            results.details.push({
              id: business.id,
              name: business.name,
              status: 'skipped',
              reason: 'already has neighborhood',
              neighborhood: business.neighborhood
            });
            continue;
          }

          // Detect neighborhood using AI
          const fullAddress = `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`;
          console.log(`🔧 Detecting neighborhood for: ${business.name} at ${fullAddress}`);
          
          const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/detect-neighborhood`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: business.name,
              address: fullAddress
            })
          });

          if (!detectRes.ok) {
            throw new Error(`Neighborhood detection failed: ${detectRes.status}`);
          }

          const detectData = await detectRes.json();
          const neighborhood = detectData.neighborhood || '';

          if (!neighborhood) {
            throw new Error('No neighborhood detected');
          }

          console.log(`🔧 Detected neighborhood for ${business.name}: ${neighborhood}`);

          // Update business with neighborhood
          await client.graphql({
            query: `
              mutation UpdateBusiness($input: UpdateBusinessInput!) {
                updateBusiness(input: $input) {
                  id
                  name
                  neighborhood
                }
              }
            `,
            variables: {
              input: {
                id: business.id,
                neighborhood: neighborhood
              }
            }
          });

          console.log(`✅ Updated ${business.name} with neighborhood: ${neighborhood}`);
          
          results.updated++;
          results.details.push({
            id: business.id,
            name: business.name,
            status: 'updated',
            neighborhood: neighborhood
          });

          // Add a small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Error updating ${business.name}:`, error);
          results.errors++;
          results.details.push({
            id: business.id,
            name: business.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log(`🔧 Neighborhood update complete:`, results);
      
      return NextResponse.json({
        success: true,
        message: `Updated ${results.updated} businesses, ${results.errors} errors`,
        results
      });
    } else {
      throw new Error('Invalid GraphQL result structure');
    }

  } catch (error) {
    console.error('❌ Error in neighborhood update:', error);
    return NextResponse.json(
      { error: 'Failed to update neighborhoods' },
      { status: 500 }
    );
  }
} 