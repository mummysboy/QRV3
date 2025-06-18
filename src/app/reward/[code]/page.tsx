// File: src/app/reward/[code]/page.tsx

import InteractiveRewardClient from "@/components/InteractiveRewardClient";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RewardPageParams {
  params: {
    code: string;
  };
}

export default async function RewardPage({ params }: RewardPageParams) {
  const { code } = params;

  const { data: claimedReward, error } = await supabase
    .from("claimed_rewards")
    .select("*")
    .eq("id", code)
    .single();

  if (error || !claimedReward) {
    notFound(); // or return a custom error component
  }

  const logoUrl = claimedReward.logokey; // already a full URL stored in DB

  return <InteractiveRewardClient card={claimedReward} logoUrl={logoUrl} />;
}
