"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CardAnimation from "@/components/CardAnimation";
import LogoVideo from "@/components/LogoVideo";

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
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (card || error) {
      const timeout = setTimeout(() => setFadeIn(true), 1100);
      return () => clearTimeout(timeout);
    }
  }, [card, error]);

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/get-claimed-reward?id=${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unknown error");
        setCard(data);
      } catch (err: unknown) {
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to load reward."
        );
      }
    };
    fetchCard();
  }, [id]);

  const handleRedeem = async () => {
    if (!card) return;
    setRedeeming(true);
    setRedeemError("");
    try {
      const res = await fetch("/api/redeem-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to redeem reward");
      }
      setRedeemed(true);
    } catch (err) {
      setRedeemError(
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to redeem reward."
      );
    } finally {
      setRedeeming(false);
    }
  };

  if (!card && !error) {
    return null;
  }

  if (error) {
    return (
      <main className="relative min-h-screen bg-white flex items-center justify-center transition-opacity duration-1000">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Reward Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/" 
            className="inline-block bg-green-800 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold shadow-md"
          >
            Go Back Home
          </Link>
        </div>
      </main>
    );
  }

  if (redeemed) {
    return (
      <div className="fixed inset-0 z-60 flex flex-col bg-white bg-opacity-95 min-h-screen overflow-y-auto pt-20">
        <div className="flex-shrink-0 mt-10 md:mt-16 lg:mt-24">
          <LogoVideo playbackRate={1.2} />
        </div>
        <div className="flex-grow flex items-start justify-center px-6 pt-10 md:pt-20">
          <div className="text-center max-w-md w-full bg-white p-8 rounded-xl">
            <div className="text-green-600 text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
            <p className="text-gray-600 mb-4">Your reward has been redeemed and can no longer be used.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className="relative min-h-screen bg-white"
      style={{
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 1.2s',
      }}
    >
      <div className={`transition-opacity duration-1000 ease-in-out`}>
        <LogoVideo playbackRate={15} />
        <CardAnimation card={card} playbackRate={15} />
        <div className="flex justify-center mt-4">
          <button
            className="bg-green-800 hover:bg-green-700 transition text-white text-lg font-semibold px-8 py-3 rounded-full shadow-md"
            onClick={() => setShowModal(true)}
          >
            Redeem Reward
          </button>
        </div>
      </div>
      {/* Modal Popout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-1000">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4 text-center">
            <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-6 text-gray-700">Once you redeem your reward you cannot use it again.</p>
            {redeemError && <p className="text-red-600 mb-3">{redeemError}</p>}
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-800 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-semibold shadow-md"
                onClick={handleRedeem}
                disabled={redeeming}
              >
                {redeeming ? "Redeeming..." : "Yes, Redeem"}
              </button>
              <button
                className="border px-8 py-3 rounded-full text-gray-700 hover:bg-gray-100 transition font-semibold"
                onClick={() => setShowModal(false)}
                disabled={redeeming}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
