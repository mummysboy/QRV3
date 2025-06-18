// src/app/reward/[code]/page.tsx

import CardAnimation from "@/components/CardAnimation";
import { createClient } from "@supabase/supabase-js";
import { JSX } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: {
    code: string;
  };
};

export default async function RewardPage({
  params,
}: PageProps): Promise<JSX.Element> {
  const { code } = params;

  const { data: claimedReward, error: claimError } = await supabase
    .from("claimed_rewards")
    .select("cardid")
    .eq("id", code)
    .single();

  if (claimError || !claimedReward) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-center p-6">
        Invalid or expired reward code.
      </div>
    );
  }

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("*")
    .eq("cardid", claimedReward.cardid)
    .single();

  if (cardError || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-center p-6">
        The associated reward card could not be found.
      </div>
    );
  }

  const { data: logoData } = supabase.storage
    .from("cards")
    .getPublicUrl(card.logokey);

  const logoUrl = logoData?.publicUrl ?? null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black">
      <CardAnimation card={card} logoUrl={logoUrl} />
    </main>
  );
}
