"use client";

import { useLanguage } from '@/contexts/LanguageContext';

export default function GoogleTranslate() {
  const { showLanguagePrompt, setShowLanguagePrompt, setLanguage } = useLanguage();

  // Show language selector when language prompt should be shown
  if (showLanguagePrompt) {
    return (
      <>
        <div className="fixed inset-0 z-[999999] flex items-start justify-end p-4">
          {/* Simple language dropdown */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-2 transform transition-all duration-300 ease-out animate-in slide-in-from-top-2 slide-in-from-right-2">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLanguagePrompt(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 flex items-center space-x-2"
              >
                <span>🇺🇸</span>
                <span>English</span>
              </button>
              <button
                onClick={() => {
                  setLanguage('es');
                  setShowLanguagePrompt(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 flex items-center space-x-2"
              >
                <span>🇪🇸</span>
                <span>Español</span>
              </button>
            </div>
          </div>
        </div>
        
        <style jsx global>{`
          /* Hide Google Translate banner and default elements */
          .goog-te-banner-frame {
            display: none !important;
          }
          
          .goog-te-gadget span {
            display: none !important;
          }
          
          body {
            top: 0 !important;
          }
        `}</style>
      </>
    );
  }

  // Simple "Change Language" button
  return (
    <button
      onClick={() => setShowLanguagePrompt(true)}
      className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
    >
      <span className="text-base">🌐</span>
      <span>Change Language</span>
    </button>
  );
}