"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";


// Update the import to use the correct props type
// Removed incorrect self-import of InteractiveRewardClient

interface ClaimedReward {
  id: string;
  logokey: string;
  [key: string]: unknown;
}

export default function InteractiveRewardPage() {
  const { code } = useParams();
  const [claimedReward, setClaimedReward] = useState<ClaimedReward | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReward = async () => {
      if (!code || typeof code !== "string") {
        setError("Invalid reward code.");
        return;
      }

      const { data, error } = await supabase
        .from("claimed_rewards")
        .select("*")
        .eq("id", code)
        .single();

      if (error || !data) {
        setError("Invalid or expired reward code.");
      } else {
        setClaimedReward(data);
      }
    };

    fetchReward();
  }, [code]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-center p-6">
        {error}
      </div>
    );
  }

  if (!claimedReward) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-center p-6">
        Loading reward...
      </div>
    );
  }

  const logoUrl = claimedReward.logokey;

  // Render the reward details here, or replace with your intended component
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <img src={logoUrl} alt="Reward Logo" className="mb-4 max-h-32" />
      <div className="text-lg font-semibold mb-2">Reward ID: {claimedReward.id}</div>
      {/* Add more reward details here as needed */}
    </div>
  );
}
