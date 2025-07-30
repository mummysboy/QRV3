"use client";

import { useEffect, useState, useRef } from "react";
import DefaultLogo from "@/components/DefaultLogo";
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
  const [isExpired, setIsExpired] = useState(false);

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
        setIsExpired(false);
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expirationDate]);

  // Don't render anything if the card is expired
  if (isExpired) {
    return null;
  }

  return (
    <div className="text-xs font-light leading-tight">
      <span className="text-red-600 font-medium">Expires in: </span>
      <span className="font-semibold">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function CardAnimation({ card, isPreview = false, isRedeem = false, disableAutoplay = false }: { card: CardProps | null, isPreview?: boolean, isRedeem?: boolean, disableAutoplay?: boolean }) {
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

  // Helper function to extract street address, city, and state from full address
  const getAddressComponents = (fullAddress: string): { street: string; city: string; state: string } => {
    if (!fullAddress) return { street: '', city: '', state: '' };
    
    // Extract state from the end of the address (before zip code)
    const stateMatch = fullAddress.match(/,\s*([A-Z]{2})\s*\d{5}(-\d{4})?$/);
    const state = stateMatch ? stateMatch[1] : '';
    
    // Remove zip code from the address but keep state
    const cleanAddress = fullAddress.replace(/,\s*[A-Z]{2}\s*\d{5}(-\d{4})?$/, '');
    
    // Split by commas to separate street from city
    const parts = cleanAddress.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      const street = parts[0];
      const city = parts[1];
      return { street, city, state };
    }
    
    // If only one part, treat it as street
    return { street: parts[0] || '', city: '', state };
  };

  // Construct the logo URL using the storage utility
  const logoUrl = cardData?.logokey
    ? cardData.logokey.startsWith("data:") || cardData.logokey.startsWith("http")
      ? cardData.logokey
      : cardData.logokey.startsWith("/")
        ? cardData.logokey // Use as-is for local/public assets
        : getStorageUrlSync(cardData.logokey)
    : null;

  // Debug: Log card data (only once on mount)
  useEffect(() => {
    console.log('CardAnimation - card prop:', card);
    console.log('CardAnimation - cardData:', cardData);
    console.log('CardAnimation - logoUrl:', logoUrl);
  }, []); // Only run once on mount

  useEffect(() => {
    if (isRedeem) {
      // For redeem context, use image with simple timeout
      if (!hasTriggered) {
        const timer = setTimeout(() => {
          setShowOverlay(true);
          setHasTriggered(true);
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
      } else {
        setShowOverlay(true);
      }
    } else {
      // For claim context, use video with original timing logic
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
        // Only auto-play if overlay hasn't been triggered yet and autoplay is not disabled
        if (!hasTriggered && !disableAutoplay) {
          video.play().catch((error) => {
            console.log("Video autoplay failed, trying user interaction:", error);
          });
        }
      };

      const handleLoadedMetadata = () => {
        // Only auto-play if overlay hasn't been triggered yet and autoplay is not disabled
        if (!hasTriggered && video.readyState >= 1 && !disableAutoplay) {
          video.play().catch(console.error);
        }
      };

      // Mobile-specific event to handle user interaction
      const handleUserInteraction = () => {
        if (video.paused && !hasTriggered && !disableAutoplay) {
          video.play().catch(console.error);
        }
      };

      // Only add event listeners if overlay hasn't been triggered
      if (!hasTriggered) {
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        // Add touch/click handlers for mobile (only if autoplay is not disabled)
        if (!disableAutoplay) {
          document.addEventListener('touchstart', handleUserInteraction, { once: true });
          document.addEventListener('click', handleUserInteraction, { once: true });
        }

        // Try to play immediately if the video is ready (only if autoplay is not disabled)
        if (video.readyState >= 3 && !disableAutoplay) {
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
    }
  }, [showOverlay, hasTriggered, isRedeem, disableAutoplay]);

  // Check if card is expired and don't render if it is (unless it's a preview)
  if (card && !isPreview && card.expires) {
    const now = new Date();
    const expiration = new Date(card.expires);
    if (expiration.getTime() <= now.getTime()) {
      console.log("⚠️ Card is expired, not rendering:", card.cardid);
      return null;
    }
  }

  return (
    <div className={`relative w-full max-w-sm mx-auto overflow-hidden ${isPreview ? 'h-auto min-h-[450px] flex items-center justify-center' : 'h-[60vh] sm:h-[60vh]'} rounded-lg`}>
      {(isPreview || (!isPreview && isRedeem)) && (
        <img
          src="/assets/videos/RedeemReward.png"
          alt="Reward Background"
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
          style={{
            objectPosition: "center",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        />
      )}
      {!isPreview && !isRedeem && (
        <video
          ref={videoRef}
          src="/assets/videos/Comp 1.mp4"
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
          onError={(e) => console.error('Video failed to load:', e)}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
        />
      )}

      <div
        className={`${isPreview ? 'relative w-full' : 'absolute inset-0'} flex items-center justify-center transition-opacity duration-[2500ms] ease-in-out ${
          isPreview ? 'opacity-100' : (showOverlay ? "opacity-100" : "opacity-0")
        }`}
        style={isPreview ? { paddingTop: '40px' } : {}}
      >
        {/* Removed Status & Quantity Overlays */}
        <div className={`bg-white text-black text-center px-1 py-1 rounded-lg ${isPreview ? 'max-w-[150px] w-full' : 'max-w-[160px] w-full'} flex flex-col justify-between transition-all duration-500 ${isPreview ? 'min-h-[140px]' : 'min-h-[130px]'} overflow-hidden`}>
          {!card ? (
            <p className="text-xs font-semibold text-gray-700 px-1 leading-tight">
              Sorry, there are no rewards available at the moment. Please try
              again later.
            </p>
          ) : (
            <>
              {/* Logo Section - Fixed size */}
              <div className="flex-shrink-0 mb-0">
                {logoUrl ? (
                  <div className="relative w-full flex justify-center" style={{ marginTop: '0' }}>
                    <img
                      src={logoUrl}
                      alt="Business Logo"
                      onError={(e) => {
                        console.error('Logo failed to load:', logoUrl);
                        // Replace with a fallback div instead of hiding
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'mx-auto flex items-center justify-center';
                        fallbackDiv.style.cssText = 'width: 100.625px !important; height: 64.6875px !important; min-width: 71.875px; min-height: 50.3125px; max-width: 129.375px; max-height: 71.875px;';
                        fallbackDiv.innerHTML = '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">QR</div>';
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
                    className="mx-auto flex items-center justify-center"
                    style={{ 
                      width: '100.625px', 
                      height: '64.6875px', 
                      minWidth: '71.875px', 
                      minHeight: '50.3125px', 
                      maxWidth: '129.375px', 
                      maxHeight: '71.875px',
                      marginTop: '0'
                    }}
                  >
                    <DefaultLogo 
                      businessName={cardData?.header || 'Business'} 
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Content Section - Dynamic sizing */}
              <div className="flex-1 flex flex-col justify-between min-h-0 max-h-full">
                {/* Header and Location */}
                <div className={`flex flex-col items-center w-full ${isPreview ? 'px-2' : 'px-1'} mb-0 sm:mb-1`}>
                  <p className={`${isPreview ? 'text-sm' : 'text-xs'} font-bold leading-tight break-words overflow-hidden text-ellipsis max-w-full line-clamp-2 ${(cardData?.header?.length || 0) > 30 ? 'text-xs' : (cardData?.header?.length || 0) > 15 ? 'text-sm' : 'text-base'}`}>
                    {cardData?.header}
                  </p>
                  <a
                    href={generateGoogleMapsUrl(
                      (cardData?.header ? cardData.header + ' ' : '') + (cardData?.addresstext || '')
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isPreview ? 'text-xs' : 'text-xs'} font-light leading-tight underline hover:text-blue-600 block -mt-3 text-xs`}
                    style={{ fontSize: '0.6rem' }}
                  >
                    {(() => {
                      const { street, city, state } = getAddressComponents(cardData?.addresstext || '');
                      const neighborhood = cardData?.neighborhood || '';
                      

                      
                      const addressLines = [];
                      
                      // Add street address (line 1)
                      if (street) {
                        addressLines.push(street);
                      }
                      
                      // Add city and state (line 2)
                      if (city && state) {
                        addressLines.push(`${city}, ${state}`);
                      } else if (city) {
                        addressLines.push(city);
                      } else if (state) {
                        addressLines.push(state);
                      }
                      
                      // Add neighborhood (line 3) if it exists and is different from city
                      if (neighborhood && neighborhood.toLowerCase() !== city.toLowerCase()) {
                        addressLines.push(neighborhood);
                      }
                      

                      
                      return addressLines.map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < addressLines.length - 1 && <br />}
                        </span>
                      ));
                    })()}
                  </a>
                </div>

                {/* Description - Dynamic sizing */}
                <div className={`flex-1 flex flex-col justify-center ${isPreview ? 'px-2' : 'px-1'} mt-0 mb-0`}>
                  <p className={`${isPreview ? 'text-xs' : 'text-xs'} leading-tight break-words overflow-hidden text-ellipsis max-w-full line-clamp-4 ${(cardData?.subheader?.length || 0) > 80 ? 'text-xs' : (cardData?.subheader?.length || 0) > 40 ? 'text-sm' : 'text-base'}`}>
                    {cardData?.subheader}
                  </p>
                </div>

                {/* Expiration - Fixed at bottom */}
                <div className={`flex-shrink-0 ${isPreview ? 'px-2' : 'px-1'} -mt-1 ${(() => {
                  if (!cardData?.expires || cardData.expires === "Demo Reward Not Valid") return '';
                  const now = new Date();
                  const exp = new Date(cardData.expires as string);
                  const diffInHours = (exp.getTime() - now.getTime()) / (1000 * 60 * 60);
                  return diffInHours > 24 ? '-mb-3' : '-mb-0';
                })()}`}> 
                  {cardData?.expires && 
                   cardData.expires !== "Demo Reward Not Valid" && 
                   (typeof cardData.expires === 'string' ? cardData.expires.trim() !== "" : true) ? (
                    isExpiringSoon(cardData.expires) ? (
                      <CountdownTimer expirationDate={String(cardData.expires)} />
                    ) : (
                      <>
                        <p className={`${isPreview ? 'text-xs' : 'text-xs'} font-light leading-tight`}>
                          Expires: {new Date(cardData.expires).toLocaleDateString()}
                        </p>
                        {/* Show Expired in red if expired */}
                        {(() => {
                          const now = new Date();
                          const exp = new Date(cardData.expires as string);
                          if (exp.getTime() <= now.getTime()) {
                            return <div className="w-full flex justify-center mt-1"><span className="text-xs font-semibold text-red-600">Expired</span></div>;
                          }
                          return null;
                        })()}
                      </>
                    )
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
