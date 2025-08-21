import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface UpdateDetail {
  cardid: string;
  header?: string;
  status: 'updated' | 'skipped' | 'error';
  neighborhood?: string;
  reason?: string;
  error?: string;
}

export async function POST() {
  try {
    const client = generateClient({ authMode: "apiKey" });

    // Get all cards
    console.log('🔧 Starting neighborhood update for all cards...');
    
    const cardsResult = await client.graphql({
      query: `
        query ListCards {
          listCards {
            items {
              cardid
              header
              addresstext
              businessId
              neighborhood
            }
          }
        }
      `
    });

    // Handle the GraphQL result properly
    if ('data' in cardsResult) {
      const cards = cardsResult.data.listCards.items;
      console.log(`🔧 Found ${cards.length} cards to update`);

      const results = {
        total: cards.length,
        updated: 0,
        errors: 0,
        details: [] as UpdateDetail[]
      };

      // Process each card
      for (const card of cards) {
        try {
          console.log(`🔧 Processing card: ${card.header} (${card.cardid})`);
          
          // Skip if already has neighborhood
          if (card.neighborhood && card.neighborhood.trim() !== '') {
            console.log(`🔧 Skipping ${card.header} - already has neighborhood: ${card.neighborhood}`);
            results.details.push({
              cardid: card.cardid,
              header: card.header,
              status: 'skipped',
              reason: 'already has neighborhood',
              neighborhood: card.neighborhood
            });
            continue;
          }

          // Try to get neighborhood from business first
          let neighborhood = '';
          if (card.businessId) {
            try {
              const businessResult = await client.graphql({
                query: `
                  query GetBusiness($id: String!) {
                    getBusiness(id: $id) {
                      id
                      name
                      neighborhood
                    }
                  }
                `,
                variables: { id: card.businessId }
              });

              if ('data' in businessResult) {
                const business = businessResult.data.getBusiness;
                if (business && business.neighborhood) {
                  neighborhood = business.neighborhood;
                  console.log(`🔧 Found business neighborhood for ${card.header}: ${neighborhood}`);
                }
              }
            } catch (err) {
              console.error(`Failed to fetch business for ${card.header}:`, err);
            }
          }

          // If no neighborhood from business, try to detect it from address
          if (!neighborhood && card.addresstext) {
            try {
              console.log(`🔧 Detecting neighborhood for ${card.header} from address: ${card.addresstext}`);
              const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/detect-neighborhood`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  businessName: card.header || 'Business',
                  address: card.addresstext
                })
              });

              if (detectRes.ok) {
                const detectData = await detectRes.json();
                neighborhood = detectData.neighborhood || '';
                console.log(`🔧 Detected neighborhood for ${card.header}: ${neighborhood}`);
              }
            } catch (err) {
              console.error(`Failed to detect neighborhood for ${card.header}:`, err);
            }
          }

          if (neighborhood) {
            // Update card with neighborhood
            await client.graphql({
              query: `
                mutation UpdateCard($input: UpdateCardInput!) {
                  updateCard(input: $input) {
                    cardid
                    header
                    neighborhood
                  }
                }
              `,
              variables: {
                input: {
                  cardid: card.cardid,
                  neighborhood: neighborhood
                }
              }
            });

            console.log(`✅ Updated ${card.header} with neighborhood: ${neighborhood}`);
            
            results.updated++;
            results.details.push({
              cardid: card.cardid,
              header: card.header,
              status: 'updated',
              neighborhood: neighborhood
            });
          } else {
            console.log(`⚠️ Could not determine neighborhood for ${card.header}`);
            results.details.push({
              cardid: card.cardid,
              header: card.header,
              status: 'error',
              error: 'Could not determine neighborhood'
            });
          }

          // Add a small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Error updating ${card.header}:`, error);
          results.errors++;
          results.details.push({
            cardid: card.cardid,
            header: card.header,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log(`🔧 Card neighborhood update complete:`, results);
      
      return NextResponse.json({
        success: true,
        message: `Updated ${results.updated} cards, ${results.errors} errors`,
        results
      });
    } else {
      throw new Error('Invalid GraphQL result structure');
    }

  } catch (error) {
    console.error('❌ Error in card neighborhood update:', error);
    return NextResponse.json(
      { error: 'Failed to update card neighborhoods' },
      { status: 500 }
    );
  }
} 