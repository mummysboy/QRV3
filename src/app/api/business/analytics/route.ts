import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface Card {
  cardid: string;
  quantity: number;
  header?: string;
  subheader?: string;
}

interface ClaimedReward {
  id: string;
  cardid: string;
  header?: string;
  claimed_at: string;
  delivery_method?: string;
}

interface AnalyticsData {
  totalRewards: number;
  activeRewards: number;
  totalClaims: number;
  totalScans: number;
  recentClaims: Array<{
    id: string;
    cardid: string;
    header: string;
    claimed_at: string;
    delivery_method: string;
  }>;
  rewardsByStatus: {
    active: number;
    inactive: number;
  };
  claimsByMonth: Array<{
    month: string;
    count: number;
  }>;
  claimsByDay: Array<{
    date: string;
    count: number;
  }>;
  claimsByWeek: Array<{
    week: string;
    count: number;
  }>;
  conversionRate: number;
  rewardAnalytics: Array<{
    cardid: string;
    header: string;
    subheader: string;
    quantity: number;
    claims: number;
    conversionRate: number;
    lastClaimed?: string;
  }>;
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
              header
              subheader
            }
          }
        }
      `,
      variables: {
        businessId: businessId,
      },
    });

    const cards = (cardsResult as { data: { listCards: { items: Card[] } } }).data.listCards.items;

    // Get all claimed rewards for this business
    const claimedRewardsResult = await client.graphql({
      query: `
        query GetBusinessClaimedRewards($businessId: String!) {
          listClaimedRewards(filter: {
            businessId: { eq: $businessId }
          }) {
            items {
              id
              cardid
              header
              claimed_at
              delivery_method
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

    // Calculate analytics
    const totalRewards = cards.length;
    const activeRewards = cards.filter(card => card.quantity > 0).length;
    const totalClaims = claimedRewards.length;
    
    // Estimate total scans (for now, we'll use claims as a proxy)
    const totalScans = totalClaims;

    // Calculate conversion rate (claims / scans * 100)
    const conversionRate = totalScans > 0 ? Math.round((totalClaims / totalScans) * 100) : 0;

    // Calculate individual reward analytics
    const rewardAnalytics = cards.map(card => {
      const cardClaims = claimedRewards.filter(claim => claim.cardid === card.cardid);
      const cardClaimsCount = cardClaims.length;
      const cardConversionRate = totalScans > 0 ? Math.round((cardClaimsCount / totalScans) * 100) : 0;
      const lastClaimed = cardClaims.length > 0 
        ? cardClaims.sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime())[0].claimed_at
        : undefined;

      return {
        cardid: card.cardid,
        header: card.header || "Unknown Reward",
        subheader: card.subheader || "",
        quantity: card.quantity,
        claims: cardClaimsCount,
        conversionRate: cardConversionRate,
        lastClaimed,
      };
    });

    // Get recent claims (last 10)
    const recentClaims = claimedRewards
      .sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime())
      .slice(0, 10)
      .map(claim => ({
        id: claim.id,
        cardid: claim.cardid,
        header: claim.header || "Unknown Reward",
        claimed_at: claim.claimed_at,
        delivery_method: claim.delivery_method || "email",
      }));

    // Calculate rewards by status
    const rewardsByStatus = {
      active: activeRewards,
      inactive: totalRewards - activeRewards,
    };

    // Calculate claims by month (last 6 months)
    const claimsByMonth = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthClaims = claimedRewards.filter(claim => {
        const claimDate = new Date(claim.claimed_at);
        return claimDate.getFullYear() === date.getFullYear() && 
               claimDate.getMonth() === date.getMonth();
      }).length;

      claimsByMonth.push({
        month: monthKey,
        count: monthClaims,
      });
    }

    // Calculate claims by week (last 8 weeks)
    const claimsByWeek = [];
    for (let i = 7; i >= 0; i--) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (now.getDay() + 7 * i));
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      const weekKey = `Week ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
      
      const weekClaims = claimedRewards.filter(claim => {
        const claimDate = new Date(claim.claimed_at);
        return claimDate >= startOfWeek && claimDate <= endOfWeek;
      }).length;

      claimsByWeek.push({
        week: weekKey,
        count: weekClaims,
      });
    }

    // Calculate claims by day (last 7 days)
    const claimsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayClaims = claimedRewards.filter(claim => {
        const claimDate = new Date(claim.claimed_at);
        return claimDate >= date && claimDate < nextDate;
      }).length;

      claimsByDay.push({
        date: dayKey,
        count: dayClaims,
      });
    }

    const analyticsData: AnalyticsData = {
      totalRewards,
      activeRewards,
      totalClaims,
      totalScans,
      recentClaims,
      rewardsByStatus,
      claimsByMonth,
      claimsByDay,
      claimsByWeek,
      conversionRate,
      rewardAnalytics,
    };

    return NextResponse.json({
      success: true,
      analytics: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching business analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
} 