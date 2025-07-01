"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CardAnimation from "@/components/CardAnimation";
import Header from "@/components/Header";
import ContactPopup from "@/components/Popups/ContactPopup";

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
  const [showModal, setShowModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (fadeIn) {
      const timeout = setTimeout(() => setShowButton(true), 400);
      return () => clearTimeout(timeout);
    }
  }, [fadeIn]);

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
      } finally {
        setLoading(false);
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
          <Link 
            href="/" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back Home
          </Link>
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

  if (redeemed) {
    return (
      <div className={`min-h-screen bg-gray-100 flex items-center justify-center transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-green-600 text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-4">Your reward has been redeemed and can no longer be used.</p>
          <Link 
            href="/" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 pt-16 transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      <Header onContactClick={() => setShowContactPopup(true)} />
      {showContactPopup && (
        <ContactPopup onClose={() => setShowContactPopup(false)} />
      )}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8"></div>
        <CardAnimation card={card} />
        <div className="mt-8 text-center">
          <button
            className={`inline-block bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold shadow
              transition-opacity duration-700 ${showButton ? "opacity-100" : "opacity-0"}`}
            onClick={() => setShowModal(true)}
          >
            Redeem Reward
          </button>
        </div>
      </div>
      {/* Modal Popout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4 text-center">
            <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-6 text-gray-700">Once you redeem your reward you cannot use it again.</p>
            {redeemError && <p className="text-red-600 mb-3">{redeemError}</p>}
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800 transition"
                onClick={handleRedeem}
                disabled={redeeming}
              >
                {redeeming ? "Redeeming..." : "Yes, Redeem"}
              </button>
              <button
                className="border px-5 py-2 rounded text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowModal(false)}
                disabled={redeeming}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
