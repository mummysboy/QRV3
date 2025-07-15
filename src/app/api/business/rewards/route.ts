import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface Card {
  cardid: string;
  quantity: number;
  logokey?: string;
  header?: string;
  subheader?: string;
  addressurl?: string;
  addresstext?: string;
  expires?: string;
  businessId?: string;
}

interface ClaimedReward {
  id: string;
  cardid: string;
  email?: string;
  phone?: string;
  delivery_method?: string;
  logokey?: string;
  header?: string;
  subheader?: string;
  addressurl?: string;
  addresstext?: string;
  expires?: string;
  claimed_at?: string;
  businessId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Get all cards for this business
    const cardsResult = await client.graphql({
      query: `
        query GetBusinessCards($businessId: String!) {
          listCards(filter: {
            businessId: { eq: $businessId }
          }) {
            items {
              cardid
              quantity
              logokey
              header
              subheader
              addressurl
              addresstext
              expires
              businessId
            }
          }
        }
      `,
      variables: {
        businessId: businessId,
      },
    });

    const cards = (cardsResult as { data: { listCards: { items: Card[] } } }).data.listCards.items;

    // Get claimed rewards for this business
    const claimedRewardsResult = await client.graphql({
      query: `
        query GetBusinessClaimedRewards($businessId: String!) {
          listClaimedRewards(filter: {
            businessId: { eq: $businessId }
          }) {
            items {
              id
              cardid
              email
              phone
              delivery_method
              logokey
              header
              subheader
              addressurl
              addresstext
              expires
              claimed_at
              businessId
            }
          }
        }
      `,
      variables: {
        businessId: businessId,
      },
    });

    const claimedRewards = (claimedRewardsResult as { data: { listClaimedRewards: { items: ClaimedReward[] } } }).data.listClaimedRewards.items;

    return NextResponse.json({
      success: true,
      cards: cards,
      claimedRewards: claimedRewards,
    });
  } catch (error) {
    console.error("Error fetching business rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API received request body:', body);
    
    const {
      businessId,
      header,
      subheader,
      quantity,
      expires,
      logokey,
      addressurl,
      addresstext,
    } = body;

    console.log('Extracted address fields:', { addressurl, addresstext });

    if (!businessId || !subheader) {
      return NextResponse.json(
        { error: "Business ID and description are required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Generate unique card ID
    const cardid = `${businessId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const cardInput = {
      cardid,
      businessId,
      quantity: parseInt(quantity) || 100,
      header: header || "Reward", // Use business name as header, fallback to "Reward"
      subheader: subheader,
      expires: expires || "",
      logokey: logokey || "",
      addressurl: addressurl || "",
      addresstext: addresstext || "",
    };

    console.log('Creating card with input:', cardInput);

    // Create new card with all business information
    const createResult = await client.graphql({
      query: `
        mutation CreateCard($input: CreateCardInput!) {
          createCard(input: $input) {
            cardid
            quantity
            logokey
            header
            subheader
            addressurl
            addresstext
            expires
            businessId
          }
        }
      `,
      variables: {
        input: cardInput,
      },
    });

    const newCard = (createResult as { data: { createCard: Card } }).data.createCard;
    
    console.log('Card created successfully:', newCard);
    console.log('Address fields in created card:', {
      addressurl: newCard.addressurl,
      addresstext: newCard.addresstext
    });

    return NextResponse.json({
      success: true,
      card: newCard,
      message: "Reward created successfully with business information",
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    return NextResponse.json(
      { error: "Failed to create reward" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cardid,
      header,
      subheader,
      quantity,
      expires,
      logokey,
      addressurl,
      addresstext,
    } = body;

    if (!cardid) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Update card
    const updateResult = await client.graphql({
      query: `
        mutation UpdateCard($input: UpdateCardInput!) {
          updateCard(input: $input) {
            cardid
            quantity
            logokey
            header
            subheader
            addressurl
            addresstext
            expires
            businessId
          }
        }
      `,
      variables: {
        input: {
          cardid,
          ...(header && { header }),
          ...(subheader !== undefined && { subheader }),
          ...(quantity && { quantity: parseInt(quantity) }),
          ...(expires !== undefined && { expires }),
          ...(logokey !== undefined && { logokey }),
          ...(addressurl !== undefined && { addressurl }),
          ...(addresstext !== undefined && { addresstext }),
        },
      },
    });

    const updatedCard = (updateResult as { data: { updateCard: Card } }).data.updateCard;

    return NextResponse.json({
      success: true,
      card: updatedCard,
    });
  } catch (error) {
    console.error("Error updating reward:", error);
    return NextResponse.json(
      { error: "Failed to update reward" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardid = searchParams.get('cardid');

    if (!cardid) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Delete card
    await client.graphql({
      query: `
        mutation DeleteCard($input: DeleteCardInput!) {
          deleteCard(input: $input) {
            cardid
          }
        }
      `,
      variables: {
        input: {
          cardid,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reward:", error);
    return NextResponse.json(
      { error: "Failed to delete reward" },
      { status: 500 }
    );
  }
} 