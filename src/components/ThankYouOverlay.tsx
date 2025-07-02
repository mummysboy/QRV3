"use client";

import { useEffect, useState } from "react";
import LogoVideo from "@/components/LogoVideo";
import Header from "@/components/Header";

interface ThankYouOverlayProps {
  remainingTime: number;
  justClaimed: boolean;
  onContactClick: () => void;
}

export default function ThankYouOverlay({
  remainingTime,
  justClaimed,
  onContactClick,
}: ThankYouOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(remainingTime);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
      // Removed broken call to onFadeInComplete
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      className={`fixed inset-0 z-0 flex flex-col bg-white transition-opacity duration-[2000ms] ease-in-out min-h-screen overflow-y-auto ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 10000 }}>
        <Header onContactClick={onContactClick} />
      </div>
      <div className="flex-shrink-0 mt-10 md:mt-16 lg:mt-24">
        <LogoVideo key="replay" playbackRate={1} />
      </div>

      <div className="flex-grow flex items-start justify-center px-6 pt-10 md:pt-20">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {justClaimed
              ? "Thank you for playing!"
              : "Looks like you already played"}
          </h2>

          {justClaimed ? (
            <p className="text-gray-600 mb-4">
              Your reward has been sent to your email. You may need to check
              your spam or promotions folder.
            </p>
          ) : (
            <p className="text-gray-600 mb-4">You can spin again in:</p>
          )}

          <p className="text-gray-500 text-sm">
            You can play again in:{" "}
            <span className="text-black font-semibold">
              {formatTime(timeLeft)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
