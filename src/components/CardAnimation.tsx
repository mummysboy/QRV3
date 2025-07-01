"use client";

import { useEffect, useState, useRef } from "react";

interface CardProps {
  cardid?: string | number;
  id?: string | number;
  cardId?: string | number;
  header?: string;
  title?: string;
  name?: string;
  business_name?: string;
  logokey?: string;
  logo?: string;
  logoUrl?: string;
  image?: string;
  addresstext?: string;
  address?: string;
  location?: string;
  addressurl?: string;
  website?: string;
  url?: string;
  subheader?: string;
  description?: string;
  subtitle?: string;
  expires?: string | Date;
  expiry?: string | Date;
  expiration_date?: string | Date;
  quantity?: number;
  qty?: number;
}

export default function CardAnimation({ card }: { card: CardProps | null }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Try different possible property names for flexibility
  const cardData = card ? {
    cardid: card.cardid || card.id || card.cardId,
    header: card.header || card.title || card.name || card.business_name,
    logokey: card.logokey || card.logo || card.logoUrl || card.image,
    addresstext: card.addresstext || card.address || card.location,
    addressurl: card.addressurl || card.website || card.url,
    subheader: card.subheader || card.description || card.subtitle,
    expires: card.expires || card.expiry || card.expiration_date,
    quantity: card.quantity || card.qty
  } : null;

  // Construct the logo URL using the public S3 path and normalize slashes
  const logoUrl = cardData?.logokey
    ? cardData.logokey.startsWith("data:") || cardData.logokey.startsWith("http")
      ? cardData.logokey
      : `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com${cardData.logokey.startsWith("/") ? cardData.logokey : `/${cardData.logokey}`}`
    : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Trigger overlay at 5.7 seconds of video playback, but only if it hasn't been triggered yet
      if (video.currentTime >= 5.7 && !showOverlay && !hasTriggered) {
        setShowOverlay(true);
        setHasTriggered(true);
      }
    };

    const handleCanPlay = () => {
      // Only auto-play if overlay hasn't been triggered yet
      if (!hasTriggered) {
        video.play().catch((error) => {
          console.log("Video autoplay failed, trying user interaction:", error);
        });
      }
    };

    const handleLoadedMetadata = () => {
      // Only auto-play if overlay hasn't been triggered yet
      if (!hasTriggered && video.readyState >= 1) {
        video.play().catch(console.error);
      }
    };

    // Mobile-specific event to handle user interaction
    const handleUserInteraction = () => {
      if (video.paused && !hasTriggered) {
        video.play().catch(console.error);
      }
    };

    // Only add event listeners if overlay hasn't been triggered
    if (!hasTriggered) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Add touch/click handlers for mobile
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      document.addEventListener('click', handleUserInteraction, { once: true });

      // Try to play immediately if the video is ready
      if (video.readyState >= 3) {
        video.play().catch(console.error);
      }
    } else {
      // If already triggered, ensure overlay stays visible
      setShowOverlay(true);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [showOverlay, hasTriggered]);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden h-[60vh] rounded-lg">
      <video
        ref={videoRef}
        src="/assets/videos/Comp%201.mp4"
        muted
        playsInline
        autoPlay
        webkit-playsinline="true"
        className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
        style={{
          objectPosition: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
        preload="metadata"
      />

      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[2500ms] ease-in-out ${
          showOverlay ? "opacity-100" : "opacity-0"
        }`}
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
                    }}
                    className="w-23 h-14 mx-auto mb-1 object-contain"
                  />
                )}
                <p className="text-lg font-bold leading-snug break-words">
                  {cardData?.header}
                </p>
                <a
                  href={cardData?.addressurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-light leading-tight underline hover:text-blue-600 block"
                >
                  {cardData?.addresstext}
                </a>
              </div>
              <div className="mt-2">
                <p className="text-sm italic leading-snug break-words">
                  {cardData?.subheader}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs font-light leading-snug">
                  Expires: {cardData?.expires ? new Date(cardData.expires).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
