"use client";

import React, {createContext, useContext, useEffect, useState} from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

type Theme = 'light' | 'dark';
type Language = 'en' | 'hi';
type Currency = 'USD' | 'INR';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string) => string;
}

const translations = {en, hi};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({children}: {children: React.ReactNode}) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedLang = localStorage.getItem('language') as Language | null;
    const storedCurrency = localStorage.getItem('currency') as Currency | null;

    if (storedTheme) setThemeState(storedTheme);
    if (storedLang) setLanguageState(storedLang);
    if (storedCurrency) setCurrencyState(storedCurrency);

    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setLanguage = (language: Language) => {
    setLanguageState(language);
    localStorage.setItem('language', language);
  };

  const setCurrency = (currency: Currency) => {
    setCurrencyState(currency);
    localStorage.setItem('currency', currency);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof en] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        currency,
        setCurrency,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
