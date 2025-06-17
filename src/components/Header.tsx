"use client";

import { useState, useRef, useEffect } from "react";

export default function Header({
  onContactClick,
}: {
  onContactClick: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
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
    <div className="w-full flex justify-end p-4 bg-green-800 text-white">
      <div className="relative" ref={menuRef}>
        <button
          id="menuToggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex flex-col justify-center items-center gap-1 w-10 h-6"
        >
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded z-50">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onContactClick();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
