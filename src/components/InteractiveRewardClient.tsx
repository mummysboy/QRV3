// File: src/components/InteractiveRewardClient.tsx
"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LogoVideo from "@/components/LogoVideo";
import CardAnimation from "@/components/CardAnimation";
import RedeemButton from "@/components/RedeemButton";
import ContactPopup from "@/components/Popups/ContactPopup";

interface ClaimedReward {
  cardid: string;
  addresstext: string;
  addressurl: string;
  subheader: string;
  expires: string;
  quantity: number;
  logokey: string;
  header?: string;
}

export default function InteractiveRewardClient({
  card,
  logoUrl,
}: {
  card: ClaimedReward;
  logoUrl: string | null;
}) {
  const [showContactPopup, setShowContactPopup] = useState(false);

  return (
    <main className="min-h-screen bg-white text-black p-6 flex flex-col items-center space-y-6">
      <Header onContactClick={() => setShowContactPopup(true)} />
      <LogoVideo />
      <CardAnimation card={card} logoUrl={logoUrl} />
      <RedeemButton cardId={card.cardid} />
      {showContactPopup && (
        <ContactPopup onClose={() => setShowContactPopup(false)} />
      )}
    </main>
  );
}
