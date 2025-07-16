"use client";

import { useEffect, useState, useRef } from "react";
import { generateGoogleMapsUrl } from "@/lib/utils";

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

export default function CardAnimation({ card, playbackRate = 1 }: { card: CardProps | null, playbackRate?: number }) {
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
      : cardData.logokey.startsWith("/")
        ? `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com${cardData.logokey}`
        : `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/${cardData.logokey}`
    : null;

  // Debug: Log card data
  console.log('CardAnimation - card prop:', card);
  console.log('CardAnimation - cardData:', cardData);
  console.log('CardAnimation - logokey:', cardData?.logokey);
  console.log('CardAnimation - constructed logoUrl:', logoUrl);
  console.log('CardAnimation - addresstext:', cardData?.addresstext);
  console.log('CardAnimation - addressurl:', cardData?.addressurl);

  // Debug when card prop changes
  useEffect(() => {
    console.log('CardAnimation - card prop changed:', card);
    console.log('CardAnimation - cardData after change:', cardData);
    console.log('CardAnimation - logoUrl after change:', logoUrl);
  }, [card, cardData, logoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;

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
  }, [showOverlay, hasTriggered, playbackRate]);

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden h-[60vh] rounded-lg">
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
        <div className="bg-white bg-opacity-90 text-black text-center px-2 py-2 rounded-lg max-w-[170px] w-full flex flex-col justify-center transition-all duration-500 shadow-lg min-h-[140px]">
          {!card ? (
            <p className="text-sm font-semibold text-gray-700 px-1 leading-tight">
              Sorry, there are no rewards available at the moment. Please try
              again later.
            </p>
          ) : (
            <>
              <div className="space-y-1 flex flex-col items-center w-full">
                {logoUrl ? (
                  <div className="relative w-full flex justify-center mb-1">
                    <img
                      src={logoUrl}
                      alt="Business Logo"
                      onError={(e) => {
                        console.error('Logo failed to load:', logoUrl);
                        // Replace with a fallback div instead of hiding
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'mx-auto bg-gray-200 rounded-lg flex items-center justify-center';
                        fallbackDiv.style.cssText = 'width: 80px !important; height: 50px !important; min-width: 60px; min-height: 40px; max-width: 100px; max-height: 60px;';
                        fallbackDiv.innerHTML = '<span class="text-gray-500 text-lg">🏢</span>';
                        e.currentTarget.parentNode?.replaceChild(fallbackDiv, e.currentTarget);
                      }}
                      onLoad={() => {
                        console.log('Logo loaded successfully:', logoUrl);
                      }}
                      className="mx-auto object-contain rounded-lg"
                      style={{ 
                        width: 'auto', 
                        height: 'auto', 
                        minWidth: '60px', 
                        minHeight: '40px', 
                        maxWidth: '100px', 
                        maxHeight: '60px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className="mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-1"
                    style={{ 
                      width: '80px', 
                      height: '50px', 
                      minWidth: '60px', 
                      minHeight: '40px', 
                      maxWidth: '100px', 
                      maxHeight: '60px'
                    }}
                  >
                    <span className="text-gray-500 text-lg">🏢</span>
                  </div>
                )}
                <p className="text-sm font-bold leading-tight break-words px-1 overflow-hidden text-ellipsis">
                  {cardData?.header}
                </p>
                <a
                  href={generateGoogleMapsUrl(
                    (cardData?.header ? cardData.header + ' ' : '') + (cardData?.addresstext || '')
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-light leading-tight underline hover:text-blue-600 block px-1"
                >
                  {cardData?.addresstext}
                </a>
              </div>
              <div className="mt-1">
                <p className="text-xs italic leading-tight break-words px-1 overflow-hidden text-ellipsis">
                  {cardData?.subheader}
                </p>
              </div>
              <div className="mt-1">
                <p className="text-xs font-light leading-tight px-1">
                  Expires: {cardData?.expires ? 
                    (cardData.expires === "Demo Reward Not Valid" ? 
                      cardData.expires : 
                      new Date(cardData.expires).toLocaleDateString()
                    ) : 'N/A'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
