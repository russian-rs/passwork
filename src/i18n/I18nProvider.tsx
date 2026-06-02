"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import sr from "./locales/sr.json";

type Translations = typeof en;
export type Language = "en" | "ru" | "sr";

const translations: Record<Language, Translations> = { en, ru, sr };

interface I18nContextType {
  t: (key: keyof Translations) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine language from localStorage or browser
    const saved = localStorage.getItem("passwork_lang") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "sr" || browserLang === "hr" || browserLang === "bs") {
        setLanguageState("sr");
      } else if (browserLang === "ru" || browserLang === "uk" || browserLang === "be") {
        setLanguageState("ru");
      } else if (browserLang === "en") {
        setLanguageState("en");
      } else {
        setLanguageState("ru"); // Fallback
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("passwork_lang", lang);
  };

  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations["ru"][key] || key;
  };

  if (!mounted) {
    // Avoid hydration mismatch by rendering nothing or default until mounted
    return null;
  }

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
