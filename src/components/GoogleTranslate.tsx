"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GoogleTranslate() {
  const { showLanguagePrompt, setShowLanguagePrompt, setLanguage } = useLanguage();
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false);

  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      if (document.getElementById('google-translate-script')) {
        setIsGoogleTranslateLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => setIsGoogleTranslateLoaded(true);
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
        
        // Listen for language changes
        const observer = new MutationObserver(() => {
          const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (selectElement) {
            // Update our language context when Google Translate changes language
            const currentLang = selectElement.value;
            if (currentLang === 'en' || currentLang === 'es') {
              setLanguage(currentLang as 'en' | 'es');
            }
          }
        });
        
        // Watch for changes in the Google Translate widget
        const translateElement = document.getElementById('google_translate_element');
        if (translateElement) {
          observer.observe(translateElement, { childList: true, subtree: true });
        }
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
  }, [setLanguage]);

  // Show Google Translate widget when language prompt should be shown
  if (showLanguagePrompt && isGoogleTranslateLoaded) {
    return (
      <>
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Choose Your Language
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Please select your preferred language to continue
            </p>
            
            <div className="flex justify-center">
              <div id="google_translate_element" className="google-translate-widget" />
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLanguagePrompt(false)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Continue with English
              </button>
            </div>
          </div>
        </div>
        
        <style jsx global>{`
          /* Style the Google Translate widget */
          .google-translate-widget .goog-te-gadget {
            font-family: inherit !important;
            border: none !important;
            background: transparent !important;
          }
          
          .google-translate-widget .goog-te-gadget-simple {
            background-color: white !important;
            border: 2px solid #e5e7eb !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
            font-weight: 500 !important;
            color: #374151 !important;
            min-width: 200px !important;
            text-align: center !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }
          
          .google-translate-widget .goog-te-gadget-simple:hover {
            border-color: #3b82f6 !important;
            background-color: #eff6ff !important;
          }
          
          /* Hide the "Powered by Google" text */
          .google-translate-widget .goog-te-gadget span {
            display: none !important;
          }
          
          /* Hide the dropdown arrow initially - we'll show it on hover */
          .google-translate-widget .goog-te-gadget-simple::after {
            content: "🌐" !important;
            margin-left: 8px !important;
          }
          
          /* Hide Google Translate banner */
          .goog-te-banner-frame {
            display: none !important;
          }
          
          body {
            top: 0 !important;
          }
        `}</style>
      </>
    );
  }

  // Regular Google Translate widget for when user is browsing
  return (
    <>
      <div id="google_translate_element" className="fixed bottom-4 right-4 z-50" />
      <style jsx global>{`
        /* Hide Google Translate banner */
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        
        /* Style the floating translate widget */
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
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .goog-te-gadget-simple:hover {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
      `}</style>
    </>
  );
}