import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardid } = body;

    if (!cardid) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // First, get the card details
    const cardResult = await client.graphql({
      query: `
        query GetCard($cardid: String!) {
          getCard(cardid: $cardid) {
            cardid
            header
            addresstext
            businessId
          }
        }
      `,
      variables: { cardid }
    });

    if ('data' in cardResult) {
      const card = cardResult.data.getCard;
      if (!card) {
        return NextResponse.json(
          { error: "Card not found" },
          { status: 404 }
        );
      }

      console.log('🔧 Updating card:', card);

      // Get business details to get neighborhood
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
            if (business) {
              neighborhood = business.neighborhood || '';
              console.log('🔧 Found business neighborhood:', neighborhood);
            }
          }
        } catch (err) {
          console.error('Failed to fetch business:', err);
        }
      }

      // If no neighborhood from business, try to detect it from address
      if (!neighborhood && card.addresstext) {
        try {
          console.log('🔧 Detecting neighborhood from address:', card.addresstext);
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
            console.log('🔧 Detected neighborhood:', neighborhood);
          }
        } catch (err) {
          console.error('Failed to detect neighborhood:', err);
        }
      }

      if (neighborhood) {
        // Update the card with neighborhood
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

        console.log('✅ Updated card with neighborhood:', neighborhood);
        
        return NextResponse.json({
          success: true,
          message: `Updated card ${cardid} with neighborhood: ${neighborhood}`,
          card: {
            cardid: card.cardid,
            header: card.header,
            neighborhood: neighborhood
          }
        });
      } else {
        return NextResponse.json(
          { error: "Could not determine neighborhood" },
          { status: 400 }
        );
      }
    } else {
      throw new Error('Invalid GraphQL result structure');
    }

  } catch (error) {
    console.error('❌ Error updating card neighborhood:', error);
    return NextResponse.json(
      { error: 'Failed to update card neighborhood' },
      { status: 500 }
    );
  }
} 