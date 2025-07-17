export async function trackCardView(cardid: string, businessId?: string) {
  try {
    const response = await fetch('/api/track-card-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardid,
        businessId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to track card view');
    }

    return response.ok;
  } catch (error) {
    console.error('Error tracking card view:', error);
    return false;
  }
}

export async function trackRewardRedemption(claimedRewardId: string) {
  try {
    const response = await fetch('/api/redeem-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        claimedRewardId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to track reward redemption');
    }

    return response.ok;
  } catch (error) {
    console.error('Error tracking reward redemption:', error);
    return false;
  }
} 