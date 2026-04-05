'use client';

import * as React from 'react';

type Language = 'ar' | 'en';

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLang?: Language;
};

type LanguageProviderState = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const initialState: LanguageProviderState = {
  lang: 'ar',
  setLang: () => null,
};

const LanguageProviderContext = React.createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLang = 'ar',
}: LanguageProviderProps) {
  const [lang, setLang] = React.useState<Language>(defaultLang);

  React.useEffect(() => {
    const savedLang = localStorage.getItem('appLang') as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <LanguageProviderContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = React.useContext(LanguageProviderContext);
  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
