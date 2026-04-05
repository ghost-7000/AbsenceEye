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

const dict = {
  ar: {
    dashboard: 'لوحة التحكم',
    teachers: 'المعلمات',
    classes: 'الصفوف',
    attendanceRecords: 'سجلات الحضور',
    settings: 'الإعدادات',
    dailySummary: 'ملخص الحضور اليومي (AI)',
    getSummaryDetails: 'احصل على ملخص ذكي لحالة الحضور والغياب لجميع الصفوف اليوم.',
    generating: 'جاري تحليل البيانات وإنشاء الملخص...',
    generateForToday: 'إنشاء ملخص لليوم',
    regenerate: 'إعادة إنشاء الملخص',
    errorGen: 'حدث خطأ أثناء إنشاء الملخص. الرجاء المحاولة مرة أخرى.',
    myClasses: 'صفوفي',
    takeAttendance: 'تسجيل الحضور',
    myRecords: 'سجلاتي'
  },
  en: {
    dashboard: 'Dashboard',
    teachers: 'Teachers',
    classes: 'Classes',
    attendanceRecords: 'Attendance Records',
    settings: 'Settings',
    dailySummary: 'Daily Attendance Summary (AI)',
    getSummaryDetails: 'Get a smart summary for the daily attendance of all classes today.',
    generating: 'Analyzing data and generating summary...',
    generateForToday: 'Generate Summary for Today',
    regenerate: 'Regenerate Summary',
    errorGen: 'An error occurred. Please try again.',
    myClasses: 'My Classes',
    takeAttendance: 'Take Attendance',
    myRecords: 'My Records'
  }
};

export const useTranslation = () => {
    const { lang } = useLanguage();
    return dict[lang];
};
