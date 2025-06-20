"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface CardData {
  cardid: string;
  addresstext: string;
  addressurl: string;
  header: string;
  subheader: string;
  expires: string;
  quantity: number;
  logokey: string;
}

export default function ClaimRewardPopup({
  card,
  onClose,
  onComplete,
}: {
  card: CardData;
  onClose: () => void;
  onComplete: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isFullyClosing, setIsFullyClosing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        triggerClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const triggerClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 1000);
  };

  const getUserIP = async (): Promise<string> => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (!card || !card.cardid) {
        setError("Reward information is missing.");
        setLoading(false);
        return;
      }

      // Step 1: Decrement quantity
      const { error: decrementError } = await supabase.rpc(
        "decrement_quantity",
        {
          card_id: card.cardid,
        }
      );

      if (decrementError) {
        console.error("Supabase RPC error:", decrementError.message);
        setError("This reward is no longer available.");
        return;
      }

      // Step 2: Get IP address
      const ip = await getUserIP();

      // Step 3: Insert claim and get generated ID
      const { data, error: insertError } = await supabase
        .from("claimed_rewards")
        .insert([
          {
            cardid: card.cardid,
            email,
            ip_address: ip,
            addresstext: card.addresstext,
            addressurl: card.addressurl,
            header: card.header,
            subheader: card.subheader,
            expires: card.expires,
            logokey: card.logokey,
          },
        ])
        .select();

      if (insertError) {
        console.error("Insert error:", insertError.message);
        setError("Failed to log reward. Please try again.");
        return;
      }

      const rewardId = data?.[0]?.id;
      const rewardUrl = `https://stately-pothos-7fa43b.netlify.app/reward/${rewardId}`;

      // Step 4: Send Email (replace with actual service)
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          url: rewardUrl,
        }),
      });

      // Step 5: Show confirmation
      setShowConfirmation(true);

      setTimeout(() => {
        setIsFullyClosing(true);
        onComplete();
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 1500);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-1000 ease-out ${
        isFullyClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        ref={popupRef}
        className={`transition-all duration-700 ease-out transform ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } bg-white p-6 rounded-xl text-center min-w-[280px] w-[90%] max-w-sm relative shadow-xl`}
      >
        {!showConfirmation && (
          <button
            onClick={triggerClose}
            className="absolute top-2 right-4 text-xl"
          >
            &times;
          </button>
        )}

        <div
          className={`transition-opacity duration-500 ease-out ${
            showConfirmation ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <h3 className="text-xl font-semibold mb-2">Claim Your Reward</h3>
          <p className="text-sm text-gray-700 mb-4">
            Enter your email and we’ll send your reward right away.
          </p>

          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <div className="text-xs text-gray-600 mb-4 leading-relaxed">
            By clicking <strong>Submit</strong>, you agree to our{" "}
            <a
              href="/terms"
              className="text-blue-600 underline"
              target="_blank"
            >
              Terms and Conditions
            </a>
            . <br />
            We respect your privacy and{" "}
            <strong>will never sell your data</strong>.
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleSubmit}
              className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded transition duration-300"
            >
              Submit
            </button>
            <button
              onClick={triggerClose}
              className="border px-5 py-2 rounded text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Loading / Confirmation */}
        <div
          className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-1000 ease-out ${
            loading || showConfirmation
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          } bg-white rounded-xl px-6`}
        >
          {loading ? (
            <>
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-green-300 border-t-green-700 animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full animate-ping bg-green-100 opacity-50"></div>
              </div>
              <p className="text-gray-700 text-sm font-medium">
                Sending your reward...
              </p>
            </>
          ) : (
            <>
              <div className="mb-3">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-black text-lg font-semibold mb-1">
                Reward claimed!
              </p>
              <p className="text-sm text-gray-600 text-center max-w-xs">
                Please check your inbox — and make sure to check your{" "}
                <strong>spam or promotions folder</strong> if you don’t see it.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
