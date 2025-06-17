"use client";

import { useState, useRef, useEffect } from "react";
import Toast from "@/components/Toast";
import { copyToClipboard } from "@/utils/clipboard";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = async () => {
    const copied = await copyToClipboard("isaac@qrewards.com");
    if (copied) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    }
    setOpen(false);
  };

  // ✅ Outside click and ESC to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative z-50" ref={wrapperRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex flex-col justify-center gap-1 p-2"
      >
        <span className="h-0.5 w-6 bg-gray-800 rounded" />
        <span className="h-0.5 w-6 bg-gray-800 rounded" />
        <span className="h-0.5 w-6 bg-gray-800 rounded" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-3 shadow-xl">
          <button
            onClick={handleCopyEmail}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Contact
          </button>
        </div>
      )}

      {showToast && <Toast message="Email copied!" />}
    </div>
  );
}
