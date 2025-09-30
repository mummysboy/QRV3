"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelectionPrompt() {
  const { showLanguagePrompt, setLanguage, setShowLanguagePrompt } = useLanguage();

  if (!showLanguagePrompt) return null;

  const handleLanguageSelect = (lang: 'en' | 'es') => {
    setLanguage(lang);
    setShowLanguagePrompt(false);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
          Choose Your Language
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Please select your preferred language to continue
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleLanguageSelect('en')}
            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <span className="text-4xl mb-2">🇺🇸</span>
            <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
              English
            </span>
          </button>
          
          <button
            onClick={() => handleLanguageSelect('es')}
            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <span className="text-4xl mb-2">🇪🇸</span>
            <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
              Español
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

