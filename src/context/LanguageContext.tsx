import React, { createContext, useState, useContext, ReactNode } from 'react';
import { en, ar } from '../locales';

type Language = 'en' | 'ar';
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
    
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = language === 'en' ? 'rtl' : 'ltr';
    
    // Update document title based on language
    const title = document.querySelector('title');
    if (title && title.hasAttribute('data-default')) {
      title.textContent = language === 'en' ? 'منصة حلول الذكاء الاصطناعي' : 'AI Solutions Marketplace';
    }
  };
  
  const translations = language === 'en' ? en : ar;
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
      <div className={language === 'ar' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};