'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n, Language, SUPPORTED_LANGUAGES } from '@/context/I18nContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-sky-200 border border-slate-700/80 hover:border-sky-500/50 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
        title="Select Language / भाषा चुनें / ভাষা বাছক"
        aria-label="Language selector"
      >
        <Globe className="h-3.5 w-3.5 text-sky-400 shrink-0" />
        <span className="font-medium text-slate-100 hidden sm:inline">
          {currentLang.nativeName}
        </span>
        <span className="font-mono text-[10px] text-sky-400 bg-sky-950/80 px-1 py-0.5 rounded border border-sky-800 uppercase sm:hidden">
          {currentLang.code}
        </span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 bg-eoc-card border border-eoc-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-3 py-2 bg-slate-950/80 border-b border-eoc-border flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Select Language
            </span>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800">
              3 Active
            </span>
          </div>

          <div className="p-1.5 space-y-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-sky-950/80 text-sky-200 border border-sky-700/60 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm leading-tight text-white">
                        {lang.nativeName}
                      </span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-[10px] text-slate-400">({lang.name})</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {lang.region}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-900 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>NER Command Center</span>
            <span className="text-emerald-400">i18n Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
