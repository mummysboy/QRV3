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
  redeemed_at?: string;
  delivery_method?: string;
}

interface CardView {
  id: string;
  cardid: string;
  businessId: string;
  viewed_at: string;
  ip_address: string;
  user_agent: string;
}

interface AnalyticsData {
  totalRewards: number;
  activeRewards: number;
  totalClaims: number;
  totalViews: number;
  totalRedeemed: number;
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
  redemptionRate: number;
  rewardAnalytics: Array<{
    cardid: string;
    header: string;
    subheader: string;
    quantity: number;
    claims: number;
    views: number;
    redeemed: number;
    conversionRate: number;
    redemptionRate: number;
    lastClaimed?: string;
    lastRedeemed?: string;
  }>;
  viewsByDay: Array<{
    date: string;
    count: number;
  }>;
  redeemedByDay: Array<{
    date: string;
    count: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const timeRange = searchParams.get('timeRange') || 'month'; // Default to month if not specified

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'day':
        // For day, we want today only
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        // For week, we want last 7 days
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // For month, we want last 30 days
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        // Default to month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

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
              redeemed_at
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

    // Get all card views for this business
    const cardViewsResult = await client.graphql({
      query: `
        query GetBusinessCardViews($businessId: String!) {
          listCardViews(filter: {
            businessId: { eq: $businessId }
          }) {
            items {
              id
              cardid
              businessId
              viewed_at
              ip_address
              user_agent
            }
          }
        }
      `,
      variables: {
        businessId: businessId,
      },
    });

    const cardViews = (cardViewsResult as { data: { listCardViews: { items: CardView[] } } }).data.listCardViews.items;

    // Filter data based on time range
    const filteredClaimedRewards = claimedRewards.filter(claim => {
      const claimDate = new Date(claim.claimed_at);
      return claimDate >= startDate;
    });

    const filteredCardViews = cardViews.filter(view => {
      const viewDate = new Date(view.viewed_at);
      return viewDate >= startDate;
    });

    // Calculate analytics based on filtered data
    const totalRewards = cards.length;
    const activeRewards = cards.filter(card => card.quantity > 0).length;
    const totalClaims = filteredClaimedRewards.length;
    const totalViews = filteredCardViews.length;
    const totalRedeemed = filteredClaimedRewards.filter(claim => claim.redeemed_at).length;

    // Calculate conversion rate (claims / views * 100)
    const conversionRate = totalViews > 0 ? Math.round((totalClaims / totalViews) * 100) : 0;
    
    // Calculate redemption rate (redeemed / claims * 100)
    const redemptionRate = totalClaims > 0 ? Math.round((totalRedeemed / totalClaims) * 100) : 0;

    // Calculate individual reward analytics based on filtered data
    const rewardAnalytics = cards.map(card => {
      const cardClaims = filteredClaimedRewards.filter(claim => claim.cardid === card.cardid);
      const cardViewsForReward = filteredCardViews.filter((view: CardView) => view.cardid === card.cardid);
      const cardRedeemed = cardClaims.filter(claim => claim.redeemed_at);
      
      const cardClaimsCount = cardClaims.length;
      const cardViewsCount = cardViewsForReward.length;
      const cardRedeemedCount = cardRedeemed.length;
      
      const cardConversionRate = cardViewsCount > 0 ? Math.round((cardClaimsCount / cardViewsCount) * 100) : 0;
      const cardRedemptionRate = cardClaimsCount > 0 ? Math.round((cardRedeemedCount / cardClaimsCount) * 100) : 0;
      
      const lastClaimed = cardClaims.length > 0 
        ? cardClaims.sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime())[0].claimed_at
        : undefined;
        
      const lastRedeemed = cardRedeemed.length > 0
        ? cardRedeemed.sort((a, b) => new Date(b.redeemed_at!).getTime() - new Date(a.redeemed_at!).getTime())[0].redeemed_at
        : undefined;

      return {
        cardid: card.cardid,
        header: card.header || "Unknown Reward",
        subheader: card.subheader || "",
        quantity: card.quantity,
        claims: cardClaimsCount,
        views: cardViewsCount,
        redeemed: cardRedeemedCount,
        conversionRate: cardConversionRate,
        redemptionRate: cardRedemptionRate,
        lastClaimed,
        lastRedeemed,
      };
    });

    // Get recent claims (last 10) from filtered data
    const recentClaims = filteredClaimedRewards
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

    // Calculate claims by month (last 6 months) - use all data for historical charts
    const claimsByMonth = [];
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

    // Calculate claims by week (last 8 weeks) - use all data for historical charts
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

    // Calculate claims by day (last 7 days) - use all data for historical charts
    const claimsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayClaims = claimedRewards.filter(claim => {
        const claimDate = new Date(claim.claimed_at);
        return claimDate >= date && claimDate < nextDate;
      }).length;
      claimsByDay.push({
        date: dayKey,
        count: dayClaims,
      });
    }

    // Calculate views by day (last 7 days) - use all data for historical charts
    const viewsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayViews = cardViews.filter(view => {
        const viewDate = new Date(view.viewed_at);
        return viewDate >= date && viewDate < nextDate;
      }).length;
      viewsByDay.push({
        date: dayKey,
        count: dayViews,
      });
    }

    // Calculate redeemed by day (last 7 days) - use all data for historical charts
    const redeemedByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayRedeemed = claimedRewards.filter(claim => {
        if (!claim.redeemed_at) return false;
        const redeemedDate = new Date(claim.redeemed_at);
        return redeemedDate >= date && redeemedDate < nextDate;
      }).length;
      redeemedByDay.push({
        date: dayKey,
        count: dayRedeemed,
      });
    }

    const analyticsData: AnalyticsData = {
      totalRewards,
      activeRewards,
      totalClaims,
      totalViews,
      totalRedeemed,
      recentClaims,
      rewardsByStatus,
      claimsByMonth,
      claimsByDay,
      claimsByWeek,
      conversionRate,
      redemptionRate,
      rewardAnalytics,
      viewsByDay,
      redeemedByDay,
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