import InteractiveRewardClient from "@/components/InteractiveRewardClient";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Params {
  code: string;
}

export default async function RewardPage({ params }: { params: Params }) {
  const { code } = params;

  const { data: claimedReward, error } = await supabase
    .from("claimed_rewards")
    .select("*")
    .eq("id", code)
    .single();

  if (error || !claimedReward) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-center p-6">
        Invalid or expired reward code.
      </div>
    );
  }

  const logoUrl = claimedReward.logokey;

  return <InteractiveRewardClient card={claimedReward} logoUrl={logoUrl} />;
}
