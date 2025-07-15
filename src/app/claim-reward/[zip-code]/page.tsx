"use client";

import { useEffect, useState } from "react";
import LogoVideo from "@/components/LogoVideo";
import CardAnimation from "@/components/CardAnimation";
import ClaimButton from "@/components/ClaimButton";
import UseRewardPopup from "@/components/Popups/UseRewardPopup";
import PostSubmitOverlay from "@/components/Popups/PostSubmitOverlay";
import ClaimRewardPopup from "@/components/Popups/ClaimRewardPopup";
import ThankYouOverlay from "@/components/ThankYouOverlay";
import { generateClient } from "aws-amplify/api";
import ContactPopup from "@/components/Popups/ContactPopup";
import { useParams } from "next/navigation";

interface CardData {
  cardid: string;
  addresstext: string;
  addressurl: string;
  subheader: string;
  expires: string;
  quantity: number;
  logokey: string;
  header: string;
}

export default function ClaimRewardPage() {
  const params = useParams();
  const zipCode = params['zip-code'] as string;
  
  const [showUseRewardPopup, setShowUseRewardPopup] = useState(false);
  const [showPostSubmit, setShowPostSubmit] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);
  const [card, setCard] = useState<CardData | null>(null);
  const [showThankYouOverlay, setShowThankYouOverlay] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Log the zip code for debugging
  useEffect(() => {
    console.log("📍 Current zip code:", zipCode);
    
    // Check if this is a demo flow by looking at the referrer
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      const isFromHomepage = referrer.includes(window.location.origin) && 
                            (referrer.endsWith('/') || referrer.endsWith(window.location.origin));
      
      if (isFromHomepage) {
        console.log("🎯 Demo flow detected - user came from homepage");
        setIsDemo(true);
      }
    }
  }, [zipCode]);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const pathname = window.location.pathname;
        const code = pathname.includes("/reward/")
          ? pathname.split("/reward/")[1]
          : null;

        let data: CardData | null = null;

        if (code) {
          console.log("🔍 Fetching claimed reward with code:", code);

          const client = generateClient();

          const result = await client.graphql({
            query: `
    query ListCards {
      listCards {
        items {
          cardid
          addresstext
          addressurl
          subheader
          expires
          quantity
          logokey
          header
        }
      }
    }
  `,
          });

          type ListCardsResult = {
            data: {
              listCards: {
                items: CardData[];
              };
            };
          };

          const cards = (result as ListCardsResult).data.listCards.items;
          if (!cards || cards.length === 0)
            throw new Error("No cards available");

          data = cards[Math.floor(Math.random() * cards.length)];

          console.log("✅ Claimed reward data:", data);
        } else {
          console.log("🔍 Fetching random card");
          const res = await fetch("/api/get-random-card");
          if (!res.ok) throw new Error("Failed to fetch random card");
          data = await res.json();
          console.log("✅ Random card data:", data);
          console.log("✅ Random card data structure:", {
            cardid: data?.cardid,
            header: data?.header,
            logokey: data?.logokey,
            addresstext: data?.addresstext,
            addressurl: data?.addressurl,
            subheader: data?.subheader,
            expires: data?.expires,
            quantity: data?.quantity
          });
        }

        console.log("📋 Setting card data:", data);
        setCard(data);
      } catch (err) {
        // If you need to use the logo URL, handle it here or pass it to a component as needed.
        console.error("🚨 Error fetching card or logo:", err);
        setCard(null);
      }
    };

    fetchCard();
  }, []);

  useEffect(() => {
    const checkCooldown = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const { ip } = await res.json();
        const storageKey = `rewardClaimedAt:${ip}`;
        let claimedAt = localStorage.getItem(storageKey);

        // Fallback to simple key if IP-based key doesn't exist
        if (!claimedAt) {
          claimedAt = localStorage.getItem("rewardClaimedAt");
        }

        if (claimedAt) {
          const elapsed = Date.now() - parseInt(claimedAt, 10);
          const remaining = 900000 - elapsed; // 15 minutes in milliseconds
          if (remaining > 0) {
            setJustClaimed(false);
            setCooldown(remaining);
            setShowThankYouOverlay(true);
            const timer = setTimeout(() => {
              setCooldown(null);
              setShowThankYouOverlay(false);
            }, remaining);
            return () => clearTimeout(timer);
          }
        }
      } catch (error) {
        console.error("Failed to check cooldown via IP", error);
        // Fallback to simple key when IP fetch fails
        const claimedAt = localStorage.getItem("rewardClaimedAt");
        if (claimedAt) {
          const elapsed = Date.now() - parseInt(claimedAt, 10);
          const remaining = 900000 - elapsed; // 15 minutes in milliseconds
          if (remaining > 0) {
            setJustClaimed(false);
            setCooldown(remaining);
            setShowThankYouOverlay(true);
            const timer = setTimeout(() => {
              setCooldown(null);
              setShowThankYouOverlay(false);
            }, remaining);
            return () => clearTimeout(timer);
          }
        }
      }
    };

    checkCooldown();
  }, []);

  const handleClaimComplete = async () => {
    const now = Date.now();
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const { ip } = await res.json();
      const storageKey = `rewardClaimedAt:${ip}`;
      localStorage.setItem(storageKey, now.toString());
    } catch (error) {
      console.error("Failed to get IP for storage, using fallback key", error);
      localStorage.setItem("rewardClaimedAt", now.toString());
    }
    
    setCooldown(900000); // 15 minutes in milliseconds

    setTimeout(() => setShowThankYouOverlay(true), 100);
    setTimeout(() => {
      setShowClaimPopup(false);
    }, 2000);
    setTimeout(() => {
      setCooldown(null);
      setShowThankYouOverlay(false);
    }, 900000); // 15 minutes in milliseconds
    setJustClaimed(true);
  };

  const handleRedeem = async () => {
    const pathname = window.location.pathname;
    const code = pathname.includes("/reward/")
      ? pathname.split("/reward/")[1]
      : null;

    const confirmed = window.confirm(
      "Are you sure you want to redeem this reward?\n\nOnce redeemed, it cannot be used again."
    );
    if (!confirmed || !code) return;

    const res = await fetch(`/api/redeem-reward?id=${code}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("❌ Failed to redeem reward.");
    } else {
      alert("✅ Reward redeemed.");
      setCard(null);
    }
  };

  const codePresent =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/reward/");

  return (
    <main className="relative min-h-screen bg-white transition-opacity duration-1000">
      {showThankYouOverlay && (
        <ThankYouOverlay
          remainingTime={cooldown ?? 0}
          justClaimed={justClaimed}
          onContactClick={() => setShowContactPopup(true)}
        />
      )}

      <div
        className={`transition-opacity duration-1000 ease-in-out ${
          showThankYouOverlay ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <LogoVideo key={cooldown ? "cooldown" : "initial"} />
        <CardAnimation card={card} />

        {card &&
          (codePresent ? (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleRedeem}
                className="bg-green-800 hover:bg-green-700 transition text-white text-lg font-semibold px-8 py-3 rounded-full shadow-md"
              >
                Redeem Reward
              </button>
            </div>
          ) : (
            <ClaimButton onClick={() => setShowClaimPopup(true)} />
          ))}

        {showClaimPopup && card && (
          <ClaimRewardPopup
            card={card}
            onClose={() => setShowClaimPopup(false)}
            onComplete={handleClaimComplete}
            isDemo={isDemo}
          />
        )}

        {showUseRewardPopup && (
          <UseRewardPopup
            onClose={() => setShowUseRewardPopup(false)}
          />
        )}

        {showPostSubmit && (
          <PostSubmitOverlay
            onClose={() => setShowPostSubmit(false)}
          />
        )}

        {showContactPopup && (
          <ContactPopup
            onClose={() => setShowContactPopup(false)}
          />
        )}
      </div>
    </main>
  );
} 