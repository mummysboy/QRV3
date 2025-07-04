"use client";

import { useEffect, useRef, useState } from "react";

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
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "sms">("email");
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 1000);
  };

  const getUserIP = async (): Promise<string> => {
    try {
      const res = await fetch("/api/ip");
      const data = await res.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits and limit to 10 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  };

  const handleSubmit = async () => {
    console.log("🔵 handleSubmit called");
    console.log("🔵 deliveryMethod:", deliveryMethod);
    console.log("🔵 email:", email);
    console.log("🔵 phone:", phone);
    console.log("🔵 card:", card);
    
    if (deliveryMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        console.log("🔴 Email validation failed");
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        console.log("🔴 Phone validation failed");
        setError("Please enter a 10-digit phone number.");
        return;
      }
    }

    console.log("🔵 Validation passed, setting loading state");
    setError("");
    setLoading(true);

    try {
      if (!card || !card.cardid) {
        console.log("🔴 Card validation failed");
        setError("Reward information is missing.");
        setLoading(false);
        return;
      }

      console.log("🔵 Getting user IP");
      const ip = await getUserIP();

      console.log("🔵 Making API call to /api/claim-reward");
      // Call AWS API to claim reward
      const res = await fetch("/api/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: deliveryMethod === "email" ? email : "",
          phone: deliveryMethod === "sms" ? phone : "",
          delivery_method: deliveryMethod,
          ip_address: ip,
          ...card,
        }),
        cache: 'no-cache', // Prevent caching
      });

      console.log("🔵 API response received:", res.status);
      const result = await res.json();
      console.log("🔵 API result:", result);
      
      if (!res.ok || !result.rewardId) {
        console.error("Claim error:", result.error);
        setError("Failed to log reward. Please try again.");
        return;
      }

      const rewardId = result.rewardId;
      const rewardUrl = `https://www.qrewards.net/reward/${rewardId}`;

      // Send reward via email or SMS
      if (deliveryMethod === "email") {
        console.log("🔵 Sending email");
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            url: rewardUrl,
          }),
        });
      } else {
        console.log("🔵 Sending SMS");
        await fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: phone,
            url: rewardUrl,
          }),
        });
      }

      console.log("🔵 Setting confirmation state");
      setShowConfirmation(true);

      setTimeout(() => {
        setIsFullyClosing(true);
        onComplete();
        setTimeout(() => onComplete(), 2000);
      }, 1500);
    } catch (err) {
      console.error("🔴 Unexpected error:", err);
      setError("Unexpected error. Please try again.");
    } finally {
      console.log("🔵 Setting loading to false");
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
            Choose how you&apos;d like to receive your reward.
          </p>

          {/* Delivery Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setDeliveryMethod("email")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                deliveryMethod === "email"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setDeliveryMethod("sms")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                deliveryMethod === "sms"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              SMS
            </button>
          </div>

          {deliveryMethod === "email" ? (
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <input
              type="tel"
              placeholder="(555) 123-4567"
              className="w-full border border-gray-300 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setPhone(formatted);
                if (error && error.includes("phone")) {
                  setError("");
                }
              }}
            />
          )}

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <div className="text-xs text-gray-600 mb-4 leading-relaxed">
            By clicking <strong>Submit</strong>, you agree to our{" "}
            <a
              href="/terms.html"
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
              onClick={() => {
                console.log("🔵 Submit button clicked");
                handleSubmit();
              }}
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
                <div className="w-16 h-16 rounded-full border-4 border-green-300 border-t-green-700 animate-spin mx-auto"></div>
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full animate-ping bg-green-100 opacity-50"></div>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-2">
                Sending your reward…
              </p>
              <p className="text-gray-500 text-sm">
                Please wait, this may take a few seconds.
              </p>
            </>
          ) : (
            <>
              <div className="mb-3">
                <svg
                  className="w-16 h-16 text-green-600 mx-auto"
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
              <p className="text-black text-xl font-bold mb-2">
                Reward sent!
              </p>
              <p className="text-gray-600 text-base text-center max-w-xs mb-2">
                {deliveryMethod === "email" 
                  ? "Please check your inbox (and your spam/promotions folder)."
                  : "Please check your phone for the SMS message."
                }
              </p>
              <button
                onClick={() => {
                  setIsFullyClosing(true);
                  setTimeout(() => onComplete(), 800);
                }}
                className="mt-2 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
