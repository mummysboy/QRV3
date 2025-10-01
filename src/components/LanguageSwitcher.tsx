"use client";

import { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';

type Language = 'en' | 'es';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
] as const;

export default function LanguageSwitcher({ currentLanguage, onLanguageChange, className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) {
        // Open dropdown with Space or Enter when button is focused
        if (document.activeElement === buttonRef.current && (event.key === ' ' || event.key === 'Enter')) {
          event.preventDefault();
          setIsOpen(true);
          setFocusedIndex(languages.findIndex(lang => lang.code === currentLanguage));
        }
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev < languages.length - 1 ? prev + 1 : 0;
            itemRefs.current[nextIndex]?.focus();
            return nextIndex;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : languages.length - 1;
            itemRefs.current[nextIndex]?.focus();
            return nextIndex;
          });
          break;

        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          itemRefs.current[0]?.focus();
          break;

        case 'End':
          event.preventDefault();
          const lastIndex = languages.length - 1;
          setFocusedIndex(lastIndex);
          itemRefs.current[lastIndex]?.focus();
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleLanguageSelect(languages[focusedIndex].code);
          }
          break;
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, currentLanguage]);

  // Focus first item when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const currentIndex = languages.findIndex(lang => lang.code === currentLanguage);
      setFocusedIndex(currentIndex);
      // Small delay to ensure dropdown is rendered
      setTimeout(() => {
        itemRefs.current[currentIndex]?.focus();
      }, 50);
    }
  }, [isOpen, currentLanguage]);

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <div className={`relative z-50 ${className}`} ref={dropdownRef}>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 relative"
        aria-label={`Select language. Currently ${currentLang.nativeName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-2xl">
          {currentLang.flag}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-3 shadow-xl z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {languages.map((lang, index) => {
            const isSelected = currentLanguage === lang.code;
            
            return (
              <button
                key={lang.code}
                ref={el => { itemRefs.current[index] = el; }}
                onClick={() => handleLanguageSelect(lang.code)}
                onMouseEnter={() => setFocusedIndex(index)}
                role="menuitem"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                tabIndex={isOpen ? 0 : -1}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                    {lang.nativeName}
                  </span>
                  {isSelected && (
                    <Check 
                      className="w-4 h-4 ml-auto text-gray-600" 
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

