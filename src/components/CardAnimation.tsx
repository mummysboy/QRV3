"use client";

import { useEffect, useState } from "react";

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

export default function CardAnimation({ card }: { card: CardData | null }) {
  const [showOverlay, setShowOverlay] = useState(false);

  // Construct the logo URL using the public S3 path and normalize slashes
  const logoUrl = card?.logokey
    ? card.logokey.startsWith("data:") || card.logokey.startsWith("http")
      ? card.logokey
      : `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com${card.logokey.startsWith("/") ? card.logokey : `/${card.logokey}`}`
    : null;


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
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      console.error("Failed to load logo:", logoUrl);
                    }}
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
