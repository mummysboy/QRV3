"use client";

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslate() {
  const { language } = useLanguage();

  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      if (document.getElementById('google-translate-script')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,es,fr,de,it,pt,zh-CN,ja,ko,ar,hi,ru',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    addScript();

    return () => {
      // Cleanup
      const script = document.getElementById('google-translate-script');
      if (script) {
        script.remove();
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  // Trigger translation when language changes
  useEffect(() => {
    const triggerTranslation = () => {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = language;
        selectElement.dispatchEvent(new Event('change'));
      }
    };

    // Wait a bit for Google Translate to initialize
    const timeout = setTimeout(triggerTranslation, 1000);
    return () => clearTimeout(timeout);
  }, [language]);

  return (
    <>
      <div id="google_translate_element" className="hidden" />
      <style jsx global>{`
        /* Hide Google Translate banner */
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        
        /* Optional: Style the translate widget if you want to show it */
        #google_translate_element {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        
        .goog-te-gadget {
          font-family: inherit;
        }
        
        /* Hide the "Powered by Google" text */
        .goog-te-gadget span {
          display: none !important;
        }
        
        .goog-te-gadget-simple {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
        }
      `}</style>
    </>
  );
}

