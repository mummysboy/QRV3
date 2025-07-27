"use client";

import { useEffect, useState } from "react";
import ContactPopup from "@/components/Popups/ContactPopup";

export default function ContactPage() {
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    // Automatically show the contact popup when the page loads
    setShowContactPopup(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Contact QRewards
        </h1>
        <p className="text-gray-600 mb-8">
          Opening contact form...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>

      {showContactPopup && (
        <ContactPopup onClose={() => setShowContactPopup(false)} />
      )}
    </div>
  );
} 