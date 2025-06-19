"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RedeemButtonProps = {
  cardId: string;
};

export default function RedeemButton({ cardId }: RedeemButtonProps) {
  const [redeemed, setRedeemed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to redeem this reward?\n\nOnce redeemed, it cannot be used again."
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("claimed_rewards")
      .delete()
      .eq("id", cardId);

    setLoading(false);

    if (error) {
      alert("❌ Failed to redeem reward. Please try again.");
      console.error("Supabase delete error:", error);
    } else {
      setRedeemed(true);
      alert("🎉 Reward successfully redeemed and removed.");
    }
  };

  if (redeemed) {
    return (
      <div className="text-green-700 font-semibold mt-4">
        ✅ Reward has been redeemed.
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
      } bg-green-800 transition text-white text-lg font-semibold px-8 py-3 rounded-full shadow-md`}
    >
      {loading ? "Redeeming..." : "Redeem Reward"}
    </button>
  );
}
