"use client";

import { useEffect, useRef, useState } from "react";

export default function ContactPopup({ onClose }: { onClose: () => void }) {
  const popupRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isFullyClosing, setIsFullyClosing] = useState(false);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fade-in mount
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        triggerClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const triggerClose = () => {
    setIsVisible(false); // trigger fade out
    setTimeout(() => onClose(), 700); // match duration
  };

  const handleSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    // Valid — fade to confirmation
    setError("");
    setShowConfirmation(true);

    // After a delay, begin full fade-out
    setTimeout(() => {
      setIsFullyClosing(true);
      setTimeout(() => onClose(), 800); // slower fade after confirmation
    }, 2000);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-700 ${
        isFullyClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        ref={popupRef}
        className={`transition-all duration-500 transform ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } bg-white p-6 rounded-xl text-center min-w-[280px] w-[90%] max-w-sm relative shadow-xl`}
      >
        {!showConfirmation && (
          <button
            onClick={triggerClose}
            className="absolute top-2 right-4 text-xl"
          >
            &times;
          </button>
        )}

        {/* Form content */}
        <div
          className={`transition-opacity duration-500 ${
            showConfirmation ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">
            We&rsquo;d be happy to hear from you!
          </h3>
          <input
            type="email"
            placeholder="Your email address"
            className="w-full border p-2 rounded mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            placeholder="Your message"
            rows={4}
            className="w-full border p-2 rounded mb-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleSubmit}
              className="bg-green-700 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
            <button onClick={triggerClose} className="border px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>

        {/* Confirmation screen */}
        <div
          className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-700 ${
            showConfirmation ? "opacity-100" : "opacity-0 pointer-events-none"
          } bg-white rounded-xl`}
        >
          <div className="mb-2">
            <svg
              className="w-16 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 32 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4h24v16H4V4zm0 0l12 8 12-8"
              />
            </svg>
          </div>
          <p className="text-black text-lg font-semibold">Message sent!</p>
        </div>
      </div>
    </div>
  );
}
