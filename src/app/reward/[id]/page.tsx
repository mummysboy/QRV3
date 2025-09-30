"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CardAnimation from "@/components/CardAnimation";
import LogoVideo from "@/components/LogoVideo";
import { useRouter } from "next/navigation";
import { trackRewardRedemption } from "@/lib/analytics";

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
  const router = useRouter();
  const [card, setCard] = useState<CardData | null>(null);
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("email");
  const [showModal, setShowModal] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState("");
  const [modalFadeIn, setModalFadeIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  useEffect(() => {
    if (card || error) {
      const timeout = setTimeout(() => setFadeIn(true), 1100);
      return () => clearTimeout(timeout);
    }
  }, [card, error]);

  useEffect(() => {
    if (showModal) {
      // Small delay to ensure the modal container is rendered before starting animation
      const timeout = setTimeout(() => setModalVisible(true), 10);
      return () => clearTimeout(timeout);
    } else {
      setModalVisible(false);
    }
  }, [showModal]);

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

  // Add claim handler
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    setClaiming(true);
    setClaimError("");
    try {
      const res = await fetch("/api/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardid: card.cardid,
          email: deliveryMethod === "email" ? email : "",
          phone: deliveryMethod === "sms" ? phone : "",
          delivery_method: deliveryMethod,
          addresstext: card.addresstext,
          addressurl: card.addressurl,
          subheader: card.subheader,
          expires: card.expires,
          logokey: card.logokey,
          header: card.header,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to claim reward");
      }
      // setClaimed(true); // This state variable was removed, so this line is removed.
    } catch (err) {
      setClaimError(
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to claim reward."
      );
    } finally {
      setClaiming(false);
    }
  };

  const handleRedeem = async () => {
    if (!card) return;
    setRedeeming(true);
    setRedeemError("");
    try {
      // Track the redemption
      await trackRewardRedemption(card.id);
      
      const res = await fetch("/api/redeem-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimedRewardId: card.id }),
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

  const isClaimed = !!card && !!card.id;

  if (!card && !error) {
    return null;
  }

  if (error) {
    return (
      <main className="relative min-h-screen bg-white flex items-center justify-center transition-opacity duration-1000">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex justify-center mb-4">
            <span style={{ fontSize: 64, display: 'inline-block' }}>🙃</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Reward Not Found</h1>
          <p className="text-gray-600 mb-4">This reward has either expired or already been claimed.</p>
          <button
            className="inline-block bg-green-800 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold shadow-md"
            style={{ color: 'white' }}
            onClick={() => {
              setShowModal(true);
              setTimeout(() => setModalFadeIn(true), 10);
            }}
          >
            Spin Again
          </button>

          {showModal && (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-100/80 transition-opacity duration-500 ${modalFadeIn ? 'opacity-100' : 'opacity-0'}`}>
              <div className={`bg-white rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center relative transition-all duration-500 ${modalFadeIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={() => { setShowModal(false); setZipInput(""); setZipError(""); setModalFadeIn(false); }}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4">Enter your zip code</h2>
                <input
                  type="text"
                  value={zipInput}
                  onChange={e => setZipInput(e.target.value)}
                  className="border border-gray-300 rounded px-4 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Zip code"
                  maxLength={10}
                  inputMode="numeric"
                />
                {zipError && <div className="text-red-500 mb-2 text-sm">{zipError}</div>}
                <button
                  className="bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors font-semibold shadow-md w-full"
                  onClick={() => {
                    const zip = zipInput.trim();
                    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
                      setZipError("Please enter a valid zip code (e.g., 12345 or 12345-6789)");
                      return;
                    }
                    setZipError("");
                    setShowModal(false);
                    setModalFadeIn(false);
                    setZipInput("");
                    router.push(`/claim-reward/${zip}`);
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (isClaimed) {
    if (redeemed) {
      // Show thank you
      return (
        <div className="fixed inset-0 z-60 flex flex-col bg-white bg-opacity-95 min-h-screen overflow-y-auto pt-24">
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
    } else {
      // Show redeem button
      return (
        <main
          className="relative min-h-screen bg-white pt-24"
          style={{
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 1.2s',
          }}
        >
          <div className={`transition-opacity duration-1000 ease-in-out`}>
            <LogoVideo playbackRate={15} />
            <CardAnimation card={card} isPreview={false} isRedeem={true} />
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
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-out ${
              modalVisible ? 'bg-neutral-100/80' : 'bg-neutral-100/0'
            }`}
                 style={{ backdropFilter: 'blur(4px)' }}>
              <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center transition-all duration-700 ease-out ${
                modalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
                   style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
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
  } else {
    // Show claim form
    return (
      <main
        className="relative min-h-screen bg-white pt-24"
        style={{
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 1.2s',
        }}
      >
        <div className={`transition-opacity duration-1000 ease-in-out`}>
          <LogoVideo playbackRate={15} />
          <CardAnimation card={card} isPreview={false} isRedeem={true} />
          <form
            className="max-w-md mx-auto mt-8 bg-white p-8 rounded-xl shadow-lg flex flex-col gap-4"
            onSubmit={handleClaim}
          >
            <h2 className="text-xl font-bold mb-2 text-center">Claim Your Reward</h2>
            <div className="flex justify-center gap-4 mb-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-full font-semibold border transition-colors ${deliveryMethod === "email" ? "bg-green-800 text-white" : "bg-white text-gray-700 border-gray-300"}`}
                onClick={() => setDeliveryMethod("email")}
                disabled={claiming}
              >
                Email
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-full font-semibold border transition-colors ${deliveryMethod === "sms" ? "bg-green-800 text-white" : "bg-white text-gray-700 border-gray-300"}`}
                onClick={() => setDeliveryMethod("sms")}
                disabled={claiming}
              >
                SMS
              </button>
            </div>
            {deliveryMethod === "email" ? (
              <input
                type="email"
                className="border rounded px-4 py-2 w-full"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={claiming}
              />
            ) : (
              <>
                <input
                  type="tel"
                  className="border rounded px-4 py-2 w-full"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  disabled={claiming}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  By claiming via SMS, you agree to receive text messages about your reward. Standard message & data rates may apply. We accept credit/debit cards and other payment methods as required.
                </p>
              </>
            )}
            {claimError && <p className="text-red-600 text-center">{claimError}</p>}
            <button
              type="submit"
              className="bg-green-800 hover:bg-green-700 transition text-white text-lg font-semibold px-8 py-3 rounded-full shadow-md mt-2"
              disabled={claiming}
            >
              {claiming ? "Claiming..." : "Submit"}
            </button>
          </form>
        </div>
      </main>
    );
  }
}
