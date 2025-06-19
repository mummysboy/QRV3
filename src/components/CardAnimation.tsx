"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

export default function CardAnimation({
  card: initialCard,
  logoUrl: initialLogoUrl,
}: {
  card: CardData | null;
  logoUrl: string | null;
}) {
  const pathname = usePathname();
  const [card, setCard] = useState<CardData | null>(initialCard);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const code = pathname?.split("/reward/")[1];
    console.log("👉 Reward code from URL:", code);

    if (!code) return;

    const fetchRewardFromCode = async () => {
      console.log("🔄 Fetching reward for code:", code);
      const { data, error } = await supabase
        .from("claimed_rewards")
        .select("*")
        .eq("id", code)
        .single();

      if (error) {
        console.error("❌ Supabase error:", error);
      } else {
        console.log("✅ Supabase data:", data);
        setCard(data);

        const { data: logoData } = supabase.storage
          .from("cards")
          .getPublicUrl(data.logokey);

        console.log("🖼️ Logo data:", logoData);

        if (logoData?.publicUrl) {
          setLogoUrl(logoData.publicUrl);
        }
      }
    };

    fetchRewardFromCode();
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden h-[60vh] rounded-lg">
      <video
        src="/assets/videos/Comp%201.mp4"
        autoPlay
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
        style={{
          objectPosition: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      />

      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[3500ms] ease-in-out ${
          showOverlay ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: showOverlay ? "3500ms" : "0ms" }}
      >
        <div className="bg-white bg-opacity-90 text-black text-center px-3 py-2 rounded-lg max-w-[160px] flex flex-col justify-center transition-all duration-500">
          {!card ? (
            <p className="text-base font-semibold text-gray-700">
              Sorry, there are no rewards available at the moment. Please try
              again later.
            </p>
          ) : (
            <>
              <div className="space-y-[2px]">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Business Logo"
                    className="w-20 h-12 mx-auto mb-1 object-contain"
                  />
                )}
                <p className="text-lg font-bold leading-snug break-words">
                  {card.header}
                </p>
                <a
                  href={card.addressurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-light leading-tight underline hover:text-blue-600 block"
                >
                  {card.addresstext}
                </a>
              </div>
              <div className="mt-2">
                <p className="text-sm italic leading-snug break-words">
                  {card.subheader}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs font-light leading-snug">
                  Expires: {new Date(card.expires).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
