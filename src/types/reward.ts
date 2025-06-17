// File: src/types/reward.ts
export interface RewardCard {
  cardid: string;
  header: string;
  addresstext: string;
  addressurl: string;
  logokey?: string;
  subheader?: string;
  expires?: string;
  quantity?: number;
}

export interface ClaimedReward extends RewardCard {
  email: string;
  claimed_at: string;
  claim_id: string;
}
