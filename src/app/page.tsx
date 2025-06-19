"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import LogoVideo from "@/components/LogoVideo";
import CardAnimation from "@/components/CardAnimation";
import ClaimButton from "@/components/ClaimButton";
import ContactPopup from "@/components/Popups/ContactPopup";
import UseRewardPopup from "@/components/Popups/UseRewardPopup";
import PostSubmitOverlay from "@/components/Popups/PostSubmitOverlay";
import ClaimRewardPopup from "@/components/Popups/ClaimRewardPopup";
import ThankYouOverlay from "@/components/ThankYouOverlay";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showUseRewardPopup, setShowUseRewardPopup] = useState(false);
  const [showPostSubmit, setShowPostSubmit] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);
  const [card, setCard] = useState<CardData | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showThankYouOverlay, setShowThankYouOverlay] = useState(false);
  const [fadeOutClaimPopup, setFadeOutClaimPopup] = useState(false);

  interface CardData {
    cardid: string;
    addresstext: string;
    addressurl: string;
    subheader: string;
    expires: string;
    quantity: number;
    logokey: string;
    header?: string;
  }

  useEffect(() => {
    const pathname = window.location.pathname;
    const code = pathname.includes("/reward/")
      ? pathname.split("/reward/")[1]
      : null;

    const fetchCard = async () => {
      try {
        let data: CardData | null = null;

        if (code) {
          console.log("🔍 Detected code:", code);
          const { data: claimed, error } = await supabase
            .from("claimed_rewards")
            .select("*")
            .eq("id", code)
            .single();

          if (error || !claimed) {
            console.error("❌ Could not fetch claimed reward:", error);
            setCard(null);
            return;
          }

          data = claimed;
        } else {
          console.log("🎲 No code found. Fetching random card...");
          const res = await fetch("/api/get-random-card");
          if (!res.ok) throw new Error("Failed to fetch card");

          data = await res.json();

          if (!data) {
            setCard(null);
            return;
          }
        }

        setCard(data);

        // ✅ Resolve logo
        if (data && data.logokey) {
          if (data.logokey.startsWith("http")) {
            setLogoUrl(data.logokey);
          } else {
            const { data: logoData } = supabase.storage
              .from("cards")
              .getPublicUrl(data.logokey);

            if (logoData?.publicUrl) {
              setLogoUrl(logoData.publicUrl);
            } else {
              console.warn("⚠️ Could not resolve logo URL for:", data.logokey);
            }
          }
        }
      } catch (error) {
        console.error("🚨 Error fetching card or logo:", error);
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

        const claimedAt = localStorage.getItem(storageKey);
        if (claimedAt) {
          const elapsed = Date.now() - parseInt(claimedAt, 10);
          const remaining = 10000 - elapsed;
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
      }
    };

    checkCooldown();
  }, []);

  const handleClaimComplete = () => {
    const now = Date.now();
    localStorage.setItem("rewardClaimedAt", now.toString());

    setCooldown(10000);
    setFadeOutClaimPopup(true);

    setTimeout(() => {
      setShowThankYouOverlay(true);
    }, 100);

    setTimeout(() => {
      setShowClaimPopup(false);
      setFadeOutClaimPopup(false);
    }, 2000);

    setTimeout(() => {
      setCooldown(null);
      setShowThankYouOverlay(false);
    }, 10000);

    setJustClaimed(true);
  };

  return (
    <main className="relative min-h-screen bg-white transition-opacity duration-1000">
      <Header onContactClick={() => setShowContactPopup(true)} />

      {showThankYouOverlay && (
        <ThankYouOverlay
          remainingTime={cooldown ?? 0}
          justClaimed={justClaimed}
          onContactClick={() => setShowContactPopup(true)} // ✅ Fix added here
        />
      )}

      <div
        className={`transition-opacity duration-1000 ease-in-out ${
          showThankYouOverlay ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <LogoVideo key={cooldown ? "cooldown" : "initial"} />

        <CardAnimation card={card} logoUrl={logoUrl} />

        {card && <ClaimButton onClick={() => setShowClaimPopup(true)} />}
      </div>

      {showContactPopup && (
        <ContactPopup onClose={() => setShowContactPopup(false)} />
      )}

      {showUseRewardPopup && (
        <UseRewardPopup onClose={() => setShowUseRewardPopup(false)} />
      )}

      {showPostSubmit && (
        <PostSubmitOverlay onClose={() => setShowPostSubmit(false)} />
      )}

      {showClaimPopup && card && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-1000 ${
            fadeOutClaimPopup ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ClaimRewardPopup
            card={card}
            onClose={() => setShowClaimPopup(false)}
            onComplete={handleClaimComplete}
          />
        </div>
      )}
    </main>
  );
}
