"use client";
import { createContext, useState, ReactNode } from "react";
import Header from "@/components/Header";
import ContactPopup from "@/components/Popups/ContactPopup";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export const ContactContext = createContext<{ onContactClick: () => void }>({ onContactClick: () => {} });

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const onContactClick = () => setShowContactPopup(true);
  const pathname = usePathname();
  return (
    <ContactContext.Provider value={{ onContactClick }}>
      <Header onContactClick={onContactClick} />
      {showContactPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
          <ContactPopup onClose={() => setShowContactPopup(false)} />
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </ContactContext.Provider>
  );
} 