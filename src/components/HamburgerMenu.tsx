"use client";

import { useState, useRef, useEffect } from "react";

interface HamburgerMenuProps {
  onContactClick: () => void;
}

export default function HamburgerMenu({ onContactClick }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleContact = () => {
    setOpen(false);
    onContactClick();
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col justify-center gap-1 p-2 relative"
        aria-label="Toggle menu"
      >
        <span className="h-0.5 w-6 bg-gray-800 rounded opacity-80" />
        <span className="h-0.5 w-6 bg-gray-800 rounded opacity-80" />
        <span className="h-0.5 w-6 bg-gray-800 rounded opacity-80" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-3 shadow-xl z-50">
          <button
            onClick={handleContact}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Contact
          </button>
        </div>
      )}
    </div>
  );
}
