'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import enLocale from '../../locales/en.json';
import hiLocale from '../../locales/hi.json';
import asLocale from '../../locales/as.json';

export type Language = 'en' | 'hi' | 'as';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Official EOC',
    flag: '🌐',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'राष्ट्रीय (National)',
    flag: '🇮🇳',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    region: 'অসম / উত্তৰ-পূব (NER)',
    flag: '🇮🇳',
  },
];

const LOCALES: Record<Language, any> = {
  en: enLocale,
  hi: hiLocale,
  as: asLocale,
};

// Key alert translations for localized dynamic alerts
const ALERT_TRANSLATIONS: Record<Language, Record<string, { title?: string; reason?: string; action?: string }>> = {
  en: {},
  hi: {
    'RED ALERT: Severe Landslide Threat & Road Cutoff': {
      title: 'रेड अलर्ट: गंभीर भूस्खलन खतरा एवं मार्ग विच्छेद',
      reason: 'अत्यधिक भारी वर्षा (>160 मिमी) के कारण संवेदनशील पहाड़ी ढलानों पर भूस्खलन का तात्कालिक खतरा।',
      action: 'पहाड़ी व नदी तटवर्ती बस्तियों से तुरंत सुरक्षित निकासी करें। राष्ट्रीय राजमार्ग को बंद करें।'
    },
    'ORANGE WARNING: Active Debris Flow on SH-5 Corridor': {
      title: 'ऑरेंज चेतावनी: एसएच-5 कॉरिडोर पर सक्रिय मलबा प्रवाह',
      reason: 'तीव्र वर्षा के कारण दरारें तेजी से चौड़ी हो रही हैं और भारी पत्थरों के गिरने का जोखिम है।',
      action: 'यातायात को डायवर्ट करें और त्वरित राहत दलों को तैनात करें।'
    },
    'YELLOW WATCH: Elevated Soil Moisture Saturation': {
      title: 'येलो वॉच: अत्यधिक मृदा जल संतृप्ति दर्ज',
      reason: 'लगातार 4 दिनों से हो रही वर्षा के कारण जल स्तर सीमा पार कर चुका है।',
      action: 'आईओटी सेंसर टेलीमेट्री पर निरंतर निगरानी रखें और गश्ती दल भेजें।'
    }
  },
  as: {
    'RED ALERT: Severe Landslide Threat & Road Cutoff': {
      title: 'ৰেড এলাৰ্ট: চৰম পাহাৰ খহনীয়া সংকট আৰু পথ বিচ্ছিন্ন',
      reason: 'অতিপাত ধাৰাষাৰ বৰষুণ (>১৬০ মিমি)ৰ বাবে সংবেদনশীল পাহাৰীয়া অঞ্চলত তৎকালে ভূমিস্খলনৰ আশংকা।',
      action: 'পাহাৰ আৰু নদীৰ কাষৰ বসতিৰ পৰা তৎকালে নিৰাপদ স্থানলৈ স্থানান্তৰ কৰক। ঘাইপথ বন্ধ কৰক।'
    },
    'ORANGE WARNING: Active Debris Flow on SH-5 Corridor': {
      title: 'অৰেঞ্জ সতৰ্কবাৰ্তা: SH-5 পথত সক্ৰিয় ধ্বংসস্তূপৰ সোঁত',
      reason: 'প্ৰচণ্ড বৰষুণৰ ফলত ফাঁটসমূহ দ্ৰুতগতিত বৃদ্ধি পাইছে আৰু বৃহৎ শিল খহি পৰাৰ সম্ভাৱনা আছে।',
      action: 'যান-বাহন চলাচল আন পথেৰে কৰক আৰু জৰুৰী দল মোতায়েন কৰক।'
    },
    'YELLOW WATCH: Elevated Soil Moisture Saturation': {
      title: 'য়েল্ল’ সতৰ্কতা: মাটিৰ অস্বাভাৱিক আৰ্দ্ৰতা বৃদ্ধি',
      reason: 'ধাৰাবাহিক ৪ দিনৰ বৰষুণৰ ফলত মাটিৰ জলস্তৰ সতৰ্কসীমা পাৰ হৈছে।',
      action: 'চেন্সৰ টেলিমেট্ৰি নিয়মীয়াকৈ পৰ্যবেক্ষণ কৰক আৰু টহলদাৰী দল প্ৰেৰণ কৰক।'
    }
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getLocalizedSeverity: (severity: string) => string;
  getLocalizedRiskLevel: (level: string) => string;
  getLocalizedPriority: (tier: string) => string;
  getLocalizedAlert: (alert: { title: string; reason: string; recommendedAction?: string }) => {
    title: string;
    reason: string;
    recommendedAction?: string;
  };
  currentLocale: any;
  supportedLanguages: LanguageOption[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'ner_landslide_guard_lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Read saved preference from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'as')) {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
      }
    } catch (e) {
      console.warn('Could not read saved language from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
  }, []);

  // Main translation resolver with nested dot lookup (e.g., 'nav.overview')
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const currentDict = LOCALES[language] || LOCALES.en;
      const fallbackDict = LOCALES.en;

      const getNested = (obj: any, path: string) => {
        return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
      };

      let result = getNested(currentDict, key);
      if (result === undefined || result === null) {
        result = getNested(fallbackDict, key);
      }

      if (result === undefined || result === null) {
        // Fallback: return last segment or full key
        return key.split('.').pop() || key;
      }

      if (typeof result !== 'string') {
        return String(result);
      }

      // Interpolate parameters {name}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return result;
    },
    [language]
  );

  const getLocalizedSeverity = useCallback(
    (severity: string): string => {
      const upper = severity?.toUpperCase();
      const direct = t(`risk.levels.${upper}`);
      if (direct && direct !== upper) return direct;
      if (upper === 'RED') return t('risk.levels.CRITICAL');
      if (upper === 'ORANGE') return t('risk.levels.HIGH');
      if (upper === 'YELLOW') return t('risk.levels.MODERATE');
      return severity;
    },
    [t]
  );

  const getLocalizedRiskLevel = useCallback(
    (level: string): string => {
      const upper = level?.toUpperCase();
      return t(`risk.levels.${upper}`) || level;
    },
    [t]
  );

  const getLocalizedPriority = useCallback(
    (tier: string): string => {
      const upper = tier?.toUpperCase();
      if (upper === 'P1') return t('emergency.p1Immediate');
      if (upper === 'P2') return t('emergency.p2Urgent');
      if (upper === 'P3') return t('emergency.p3High');
      if (upper === 'P4') return t('emergency.p4Monitor');
      return tier;
    },
    [t]
  );

  const getLocalizedAlert = useCallback(
    (alert: { title: string; reason: string; recommendedAction?: string }) => {
      if (language === 'en') return alert;
      const dict = ALERT_TRANSLATIONS[language] || {};
      const match = dict[alert.title];
      if (match) {
        return {
          title: match.title || alert.title,
          reason: match.reason || alert.reason,
          recommendedAction: match.action || alert.recommendedAction,
        };
      }
      return alert;
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getLocalizedSeverity,
      getLocalizedRiskLevel,
      getLocalizedPriority,
      getLocalizedAlert,
      currentLocale: LOCALES[language],
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, getLocalizedSeverity, getLocalizedRiskLevel, getLocalizedPriority, getLocalizedAlert]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export const useTranslation = useI18n;
