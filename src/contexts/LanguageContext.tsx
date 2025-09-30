"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  showLanguagePrompt: boolean;
  setShowLanguagePrompt: (show: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  showLanguagePrompt: false,
  setShowLanguagePrompt: () => {},
});

// Helper functions for cookie management
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    setMounted(true);
    const savedLanguage = getCookie('preferredLanguage') as Language;
    
    if (savedLanguage === 'en' || savedLanguage === 'es') {
      setLanguageState(savedLanguage);
      setShowLanguagePrompt(false);
    } else {
      // No saved preference - show the language selection prompt
      setShowLanguagePrompt(true);
      // Default to English while waiting for user selection
      setLanguageState('en');
    }
  }, []);

  // Update HTML lang attribute whenever language changes
  useEffect(() => {
    if (!mounted) return;
    
    // Update the HTML lang attribute
    document.documentElement.lang = language;
    
    // Update meta tags for better SEO
    let metaLang = document.querySelector('meta[http-equiv="content-language"]');
    if (!metaLang) {
      metaLang = document.createElement('meta');
      metaLang.setAttribute('http-equiv', 'content-language');
      document.head.appendChild(metaLang);
    }
    metaLang.setAttribute('content', language);
  }, [language, mounted]);

  // Save language preference
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setCookie('preferredLanguage', lang, 365); // Save for 1 year
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, showLanguagePrompt, setShowLanguagePrompt }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
