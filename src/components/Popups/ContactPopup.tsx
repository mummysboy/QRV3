"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Input, Card } from "../ui";

export default function ContactPopup({ onClose }: { onClose: () => void }) {
  const popupRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isFullyClosing, setIsFullyClosing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/add-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }
      setShowConfirmation(true);
      setTimeout(() => {
        setIsFullyClosing(true);
        setTimeout(() => onClose(), 800);
      }, 2000);
    } catch (err) {
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to send message."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-700 bg-black/50 backdrop-blur-sm z-50 ${
        isFullyClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        ref={popupRef}
        className={`transition-all duration-500 transform ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } min-w-[280px] w-[90%] max-w-md relative`}
      >
        <Card className="relative">
          {!showConfirmation && (
            <button
              onClick={triggerClose}
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 transition-colors duration-150 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 z-10"
              aria-label="Close popup"
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
            <h3 className="text-xl font-semibold mb-6 text-gray-900 text-center">
              We&apos;d be happy to hear from you!
            </h3>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
              <textarea
                placeholder="Your message"
                rows={4}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150 text-gray-900 placeholder-gray-500 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
              />
            </div>
            
            {error && (
              <p className="text-sm text-error-600 mt-3 bg-error-50 p-3 rounded-lg border border-error-200">
                {error}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting}
                className="flex-1"
              >
                Submit
              </Button>
              <Button
                variant="secondary"
                onClick={triggerClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Confirmation screen */}
          <div
            className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-700 ${
              showConfirmation ? "opacity-100" : "opacity-0 pointer-events-none"
            } bg-white rounded-2xl`}
          >
            <div className="mb-4">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Thank you!
            </h4>
            <p className="text-gray-600 text-center px-4">
              We will be in contact shortly.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
