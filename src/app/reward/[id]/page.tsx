"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CardAnimation from "@/components/CardAnimation";

interface CardData {
  id: string;
  cardid: string;
  addresstext: string;
  addressurl: string;
  subheader: string;
  expires: string;
  quantity?: number;
  logokey: string;
  header: string;
  email: string;
  claimed_at: string;
}

export default function RewardPage() {
  const { id } = useParams();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return;
      
      try {
        console.log("🔍 Fetching reward with ID:", id);
        const res = await fetch(`/api/get-claimed-reward?id=${id}`);
        const data = await res.json();
        
        if (!res.ok) {
          console.error("❌ API Error:", data.error);
          throw new Error(data.error || "Unknown error");
        }
        
        console.log("✅ Reward data received:", data);
        setCard(data);
      } catch (err: unknown) {
        console.error("❌ Fetch error:", err);
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to load reward."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reward...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Reward Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No reward data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Reward</h1>
          <p className="text-gray-600">Claimed on {new Date(card.claimed_at).toLocaleDateString()}</p>
        </div>
        
        <CardAnimation card={card} />
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Claim Another Reward
          </a>
        </div>
      </div>
    </div>
  );
}
