"use client";
import { createContext, useState, ReactNode } from "react";
import Header from "@/components/Header";
import ContactPopup from "@/components/Popups/ContactPopup";

export const ContactContext = createContext<{ onContactClick: () => void }>({ onContactClick: () => {} });

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const onContactClick = () => setShowContactPopup(true);
  return (
    <ContactContext.Provider value={{ onContactClick }}>
      <Header onContactClick={onContactClick} />
      {showContactPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
          <ContactPopup onClose={() => setShowContactPopup(false)} />
        </div>
      )}
      <main>{children}</main>
    </ContactContext.Provider>
  );
} 