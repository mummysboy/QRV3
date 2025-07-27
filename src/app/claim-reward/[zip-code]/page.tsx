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
import { trackCardView } from "@/lib/analytics";
import { isCardExpired } from "@/lib/utils";

interface CardData {
  cardid: string;
  addresstext: string;
  addressurl: string;
  subheader: string;
  expires: string;
  quantity: number;
  logokey: string;
  header: string;
  neighborhood?: string;
  businessId?: string;
}

export default function ClaimRewardPage() {
  const params = useParams();
  const zipCode = params['zip-code'] as string;
  
  const [showUseRewardPopup, setShowUseRewardPopup] = useState(false);
  const [showPostSubmit, setShowPostSubmit] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
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

  // Combined cooldown check and card fetching logic
  useEffect(() => {
    const initializePage = async () => {
      console.log("🚀 Page initialization starting...");
      
      // First, check cooldown
      let cooldownActive = false;
      let remainingTime = 0;
      
      // Try IP-based cooldown first, with better error handling
      try {
        const res = await fetch("https://api.ipify.org?format=json", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        
        if (!res.ok) {
          throw new Error(`IP fetch failed with status: ${res.status}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('IP fetch returned non-JSON response');
        }
        
        const { ip } = await res.json();
        const storageKey = `rewardClaimedAt:${ip}`;
        let claimedAt = localStorage.getItem(storageKey);

        // Fallback to simple key if IP-based key doesn't exist
        if (!claimedAt) {
          claimedAt = localStorage.getItem("rewardClaimedAt");
        }

        if (claimedAt) {
          const elapsed = Date.now() - parseInt(claimedAt, 10);
          remainingTime = 900000 - elapsed; // 15 minutes in milliseconds
          if (remainingTime > 0) {
            console.log("⏰ Cooldown active, remaining:", Math.floor(remainingTime / 1000 / 60), "minutes");
            cooldownActive = true;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log("⚠️ IP-based cooldown check failed, using fallback:", errorMessage);
        // Fallback to simple key when IP fetch fails
        const claimedAt = localStorage.getItem("rewardClaimedAt");
        if (claimedAt) {
          const elapsed = Date.now() - parseInt(claimedAt, 10);
          remainingTime = 900000 - elapsed; // 15 minutes in milliseconds
          if (remainingTime > 0) {
            console.log("⏰ Cooldown active (fallback), remaining:", Math.floor(remainingTime / 1000 / 60), "minutes");
            cooldownActive = true;
          }
        }
      }

      // If cooldown is active, show thank you overlay and don't fetch card
      if (cooldownActive) {
        console.log("⏸️ Cooldown active - showing thank you overlay, skipping card fetch");
        setCooldown(remainingTime);
        setShowThankYouOverlay(true);
        
        const timer = setTimeout(() => {
          setCooldown(null);
          setShowThankYouOverlay(false);
        }, remainingTime);
        return () => clearTimeout(timer);
      }

      // If no cooldown, fetch the card
      console.log("✅ No cooldown active - fetching card");
      
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
          neighborhood
          businessId
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
          console.log("🔍 Fetching card for zip code:", zipCode);
          const res = await fetch(`/api/get-card-by-zip?zip=${zipCode}`);
          if (!res.ok) {
            console.log("❌ Failed to fetch card by zip, falling back to random card");
            const randomRes = await fetch("/api/get-random-card");
            if (!randomRes.ok) throw new Error("Failed to fetch card");
            data = await randomRes.json();
          } else {
            data = await res.json();
          }
          console.log("✅ Card data:", data);
          console.log("✅ Card data structure:", {
            cardid: data?.cardid,
            header: data?.header,
            logokey: data?.logokey,
            addresstext: data?.addresstext,
            addressurl: data?.addressurl,
            subheader: data?.subheader,
            expires: data?.expires,
            quantity: data?.quantity,
            neighborhood: data?.neighborhood
          });
        }

        console.log("📋 Setting card data:", data);
        
        // Additional safety check: verify the card is not expired
        if (data && isCardExpired(data.expires)) {
          console.log("⚠️ Card is expired, not displaying:", data.cardid);
          setCard(null);
          return;
        }
        
        setCard(data);
        
        // Track the card view for analytics
        if (data?.cardid) {
          try {
            await trackCardView(data.cardid, data.businessId);
            console.log("📊 Card view tracked for analytics");
          } catch (error) {
            console.error("❌ Failed to track card view:", error);
          }
        }
      } catch (err) {
        console.error("🚨 Error fetching card or logo:", err);
        setCard(null);
      }
    };

    initializePage();
  }, [zipCode]);



  const handleClaimComplete = async () => {
    const now = Date.now();
    try {
      const res = await fetch("https://api.ipify.org?format=json", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!res.ok) {
        throw new Error(`IP fetch failed with status: ${res.status}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('IP fetch returned non-JSON response');
      }
      
      const { ip } = await res.json();
      const storageKey = `rewardClaimedAt:${ip}`;
      localStorage.setItem(storageKey, now.toString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log("⚠️ IP-based storage failed, using fallback key:", errorMessage);
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
    <main className="relative min-h-screen bg-white transition-opacity duration-1000 pt-24">
      {showThankYouOverlay && (
        <ThankYouOverlay
          remainingTime={cooldown ?? 0}
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
            <>
              <ClaimButton onClick={() => setShowClaimPopup(true)} />
              {/* Show the share and no thank you options only after the claim button is rendered */}
              <div className="mt-3 text-center text-gray-400 text-sm">
                Reward not relevant for you?{' '}
                <button
                  className="underline text-gray-500 hover:text-green-700 transition-colors"
                  style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  onClick={() => setShowClaimPopup(true)}
                  type="button"
                >
                  send
                </button>{' '}
                it to a friend
              </div>
              <div className="flex justify-center mt-4">
                <button
                  className="text-gray-400 hover:text-gray-600 text-sm underline transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setCooldown(900000);
                    setShowThankYouOverlay(true);
                  }}
                  type="button"
                >
                  No thank you
                </button>
              </div>
            </>
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
      {/* Subtle footer */}
      <footer className="w-full relative z-10 border-t border-slate-200/60 py-12 mt-20 bg-white">
        <div className="w-full text-center">
          <p className="text-slate-500 text-base md:text-lg text-center">
            © 2024 QRewards. Connecting businesses with customers.
          </p>
        </div>
      </footer>
    </main>
  );
} 