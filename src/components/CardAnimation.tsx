"use client";

import { useEffect, useState, useRef } from "react";
import { generateGoogleMapsUrl } from "@/lib/utils";
import { getStorageUrlSync } from "@/lib/storage";

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
  neighborhood?: string; // AI-detected neighborhood
}

// Countdown Timer Component
function CountdownTimer({ expirationDate }: { expirationDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiration = new Date(expirationDate).getTime();
      const difference = expiration - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expirationDate]);

  return (
    <div className="text-xs font-light leading-tight px-1">
      <span className="text-red-600 font-medium">Expires in: </span>
      <span className="font-semibold">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function CardAnimation({ card, playbackRate = 1, isPreview = false }: { card: CardProps | null, playbackRate?: number, isPreview?: boolean }) {
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
    quantity: card.quantity || card.qty,
    neighborhood: card.neighborhood,
  } : null;

  // Helper function to check if expiration is less than 24 hours
  const isExpiringSoon = (expirationDate: string | Date) => {
    if (!expirationDate || expirationDate === "Demo Reward Not Valid") return false;
    
    const now = new Date().getTime();
    const expiration = new Date(expirationDate).getTime();
    const difference = expiration - now;
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return difference > 0 && difference <= twentyFourHours;
  };

  // Helper function to extract city and state from full address
  const getCityStateFromAddress = (fullAddress: string): string => {
    if (!fullAddress) return '';
    
    // Try to match patterns like "City, State ZIP" or "City, State"
    const cityStateMatch = fullAddress.match(/([^,]+),\s*([A-Z]{2})\s*\d{5}/);
    if (cityStateMatch) {
      return `${cityStateMatch[1].trim()}, ${cityStateMatch[2]}`;
    }
    
    // Fallback: try to extract city and state from the end of the address
    const parts = fullAddress.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      const stateMatch = lastPart.match(/^([A-Z]{2})\s*\d{5}/);
      if (stateMatch) {
        const city = parts[parts.length - 2];
        return `${city}, ${stateMatch[1]}`;
      }
    }
    
    // If no pattern matches, return the original address
    return fullAddress;
  };

  // Construct the logo URL using the storage utility
  const logoUrl = cardData?.logokey
    ? cardData.logokey.startsWith("data:") || cardData.logokey.startsWith("http") || cardData.logokey.startsWith("/")
      ? cardData.logokey
      : getStorageUrlSync(cardData.logokey)
    : null;

  // Debug: Log card data
  console.log('CardAnimation - card prop:', card);
  console.log('CardAnimation - cardData:', cardData);
  console.log('CardAnimation - logokey:', cardData?.logokey);
  console.log('CardAnimation - constructed logoUrl:', logoUrl);
  console.log('CardAnimation - addresstext:', cardData?.addresstext);
  console.log('CardAnimation - addressurl:', cardData?.addressurl);
  console.log('CardAnimation - neighborhood:', cardData?.neighborhood);
  console.log('CardAnimation - storage utility result:', getStorageUrlSync(cardData?.logokey || ''));

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
    <div className={`relative w-full max-w-sm mx-auto overflow-hidden ${isPreview ? 'h-auto min-h-[200px] flex items-center justify-center' : 'h-[60vh] sm:h-[60vh]'} rounded-lg`}>
      {!isPreview && (
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
      )}

      <div
        className={`${isPreview ? 'relative w-full' : 'absolute inset-0'} flex items-center justify-center transition-opacity duration-[2500ms] ease-in-out ${
          isPreview ? 'opacity-100' : (showOverlay ? "opacity-100" : "opacity-0")
        }`}
      >
        {/* Removed Status & Quantity Overlays */}
        <div className={`bg-white text-black text-center px-3 py-3 rounded-lg ${isPreview ? 'max-w-[180px] w-full' : 'max-w-[160px] w-full'} flex flex-col justify-center transition-all duration-500 ${isPreview ? 'min-h-[160px]' : 'min-h-[130px]'}`}>
          {!card ? (
            <p className="text-xs font-semibold text-gray-700 px-1 leading-tight">
              Sorry, there are no rewards available at the moment. Please try
              again later.
            </p>
          ) : (
            <>
              <div className={`space-y-2 flex flex-col items-center w-full ${isPreview ? 'px-2' : 'px-1'}`}>
                {logoUrl ? (
                  <div className="relative w-full flex justify-center mb-2" style={{ marginTop: '-5%' }}>
                    <img
                      src={logoUrl}
                      alt="Business Logo"
                      onError={(e) => {
                        console.error('Logo failed to load:', logoUrl);
                        // Replace with a fallback div instead of hiding
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'mx-auto bg-gray-200 rounded-lg flex items-center justify-center';
                        fallbackDiv.style.cssText = 'width: 100.625px !important; height: 64.6875px !important; min-width: 71.875px; min-height: 50.3125px; max-width: 129.375px; max-height: 71.875px;';
                        fallbackDiv.innerHTML = '<span class="text-gray-500 text-base">🏢</span>';
                        e.currentTarget.parentNode?.replaceChild(fallbackDiv, e.currentTarget);
                      }}
                      onLoad={() => {
                        console.log('Logo loaded successfully:', logoUrl);
                      }}
                      className="mx-auto object-contain rounded-lg"
                      style={{ 
                        width: 'auto', 
                        height: 'auto', 
                        minWidth: '71.875px', 
                        minHeight: '50.3125px', 
                        maxWidth: '129.375px', 
                        maxHeight: '71.875px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className="mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-2"
                    style={{ 
                      width: '100.625px', 
                      height: '64.6875px', 
                      minWidth: '71.875px', 
                      minHeight: '50.3125px', 
                      maxWidth: '129.375px', 
                      maxHeight: '71.875px',
                      marginTop: '-5%'
                    }}
                  >
                    <span className="text-gray-500 text-base">🏢</span>
                  </div>
                )}
                <p className={`${isPreview ? 'text-sm' : 'text-sm'} font-bold leading-tight break-words overflow-hidden text-ellipsis`}>
                  {cardData?.header}
                </p>
                <a
                  href={generateGoogleMapsUrl(
                    (cardData?.header ? cardData.header + ' ' : '') + (cardData?.addresstext || '')
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isPreview ? 'text-xs' : 'text-xs'} font-light leading-tight underline hover:text-blue-600 block`}
                >
                  {(() => {
                    const city = getCityStateFromAddress(cardData?.addresstext || '').split(',')[0] || '';
                    const district = cardData?.neighborhood || '';
                    
                    // If neighborhood is the same as city, just show city once
                    if (district && district.toLowerCase() === city.toLowerCase()) {
                      const displayText = city;
                      console.log('CardAnimation - Display text:', displayText, 'neighborhood:', cardData?.neighborhood, 'city:', city);
                      return displayText;
                    }
                    
                    // If we have a different neighborhood, show city and district on separate lines
                    if (district) {
                      const displayText = `${city}\n${district}`;
                      console.log('CardAnimation - Display text:', displayText, 'neighborhood:', cardData?.neighborhood, 'city:', city);
                      return displayText.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < displayText.split('\n').length - 1 && <br />}
                        </span>
                      ));
                    }
                    
                    // Fallback to original city/state format
                    const displayText = getCityStateFromAddress(cardData?.addresstext || '');
                    console.log('CardAnimation - Display text:', displayText, 'neighborhood:', cardData?.neighborhood, 'city:', city);
                    return displayText;
                  })()}
                </a>
              </div>
              <div className={`mt-2 ${isPreview ? 'px-2' : 'px-1'}`}>
                <p className={`${isPreview ? 'text-xs' : 'text-xs'} italic leading-tight break-words overflow-hidden text-ellipsis`}>
                  {cardData?.subheader}
                </p>
              </div>
              <div className={`mt-2 ${isPreview ? 'px-2' : 'px-1'}`}>
                {cardData?.expires && 
                 cardData.expires !== "Demo Reward Not Valid" && 
                 (typeof cardData.expires === 'string' ? cardData.expires.trim() !== "" : true) ? (
                  isExpiringSoon(cardData.expires) ? (
                    <CountdownTimer expirationDate={String(cardData.expires)} />
                  ) : (
                    <p className={`${isPreview ? 'text-xs' : 'text-xs'} font-light leading-tight`}>
                      Expires: {new Date(cardData.expires).toLocaleDateString()}
                    </p>
                  )
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
