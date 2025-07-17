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