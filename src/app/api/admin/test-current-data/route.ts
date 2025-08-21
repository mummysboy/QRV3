import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient({ authMode: "apiKey" });
    
    console.log("🔍 Checking current database state...");

    // Check business users
    const businessUsersResult = await client.graphql({
      query: `
        query ListAllBusinessUsers {
          listBusinessUsers {
            items {
              id
              email
              businessId
              firstName
              lastName
              status
            }
          }
        }
      `
    });
    const businessUsers = (businessUsersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; businessId: string; firstName: string; lastName: string; status: string }> } } }).data.listBusinessUsers.items;

    // Check signups
    const signupsResult = await client.graphql({
      query: `
        query ListAllSignups {
          listSignups {
            items {
              id
              email
              firstName
              lastName
              status
            }
          }
        }
      `
    });
    const signups = (signupsResult as { data: { listSignups: { items: Array<{ id: string; email: string; firstName: string; lastName: string; status: string }> } } }).data.listSignups.items;

    // Check businesses
    const businessesResult = await client.graphql({
      query: `
        query ListAllBusinesses {
          listBusinesses {
            items {
              id
              name
              email
              status
            }
          }
        }
      `
    });
    const businesses = (businessesResult as { data: { listBusinesses: { items: Array<{ id: string; name: string; email: string; status: string }> } } }).data.listBusinesses.items;

    // Check cards
    const cardsResult = await client.graphql({
      query: `
        query ListAllCards {
          listCards {
            items {
              cardid
              businessId
              header
            }
          }
        }
      `
    });
    const cards = (cardsResult as { data: { listCards: { items: Array<{ cardid: string; businessId?: string; header?: string }> } } }).data.listCards.items;

    const preservedEmails = ["isaac@rightimagedigital.com", "gwbn.mariadaniel@gmail.com"];
    
    const nonPreservedBusinessUsers = businessUsers.filter(user => !preservedEmails.includes(user.email));
    const nonPreservedSignups = signups.filter(signup => !preservedEmails.includes(signup.email));
    const nonPreservedBusinesses = businesses.filter(business => !preservedEmails.includes(business.email));
    const orphanedCards = cards.filter(card => !card.businessId);

    return NextResponse.json({
      success: true,
      summary: {
        totalBusinessUsers: businessUsers.length,
        totalSignups: signups.length,
        totalBusinesses: businesses.length,
        totalCards: cards.length,
        nonPreservedBusinessUsers: nonPreservedBusinessUsers.length,
        nonPreservedSignups: nonPreservedSignups.length,
        nonPreservedBusinesses: nonPreservedBusinesses.length,
        orphanedCards: orphanedCards.length
      },
      data: {
        businessUsers: businessUsers.map(u => ({ email: u.email, businessId: u.businessId, status: u.status })),
        signups: signups.map(s => ({ email: s.email, status: s.status })),
        businesses: businesses.map(b => ({ name: b.name, email: b.email, status: b.status })),
        cards: cards.map(c => ({ cardid: c.cardid, businessId: c.businessId, header: c.header }))
      }
    });

  } catch (error) {
    console.error("❌ Error checking current data:", error);
    return NextResponse.json(
      { 
        error: "Failed to check current data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 