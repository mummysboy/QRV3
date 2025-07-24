"use client";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/utils";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("cookie_consent");
      const session = getCookie("qrewards_session");
      // Only show if user is logged in and has not accepted
      if (!consent && session) setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setVisible(false);
  };

  const handleDeny = () => {
    // Do not set consent, just hide for now (will show again next login)
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-full max-w-md px-4">
      <div className="bg-white/90 border border-gray-200 shadow-xl rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex-1 text-gray-800 text-sm mb-2 sm:mb-0">
          We use cookies to keep you logged in and personalize your experience. By continuing, you agree to our use of cookies.
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded-xl text-green-700 font-medium text-sm transition-colors border border-green-300 shadow-sm"
          >
            Accept
          </button>
          <button
            onClick={handleDeny}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium text-sm transition-colors border border-gray-300 shadow-sm"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
} 