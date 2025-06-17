"use client";

import { useState, useRef, useEffect } from "react";
import Toast from "./Toast";
import { copyToClipboard } from "@/utils/clipboard";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = async () => {
    const copied = await copyToClipboard("isaac@qrewards.com");
    if (copied) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    }
    setOpen(false);
  };

  // 🔄 Close on outside click or ESC key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col justify-center gap-1 p-2 z-50 relative"
      >
        <span className="h-0.5 w-6 bg-gray-800 rounded" />
        <span className="h-0.5 w-6 bg-gray-800 rounded" />
        <span className="h-0.5 w-6 bg-gray-800 rounded" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-3 shadow-xl z-50">
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
