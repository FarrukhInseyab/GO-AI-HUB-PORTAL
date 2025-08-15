import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if URL ends with /ar to determine initial language
  const getInitialLanguage = (): Language => {
    return location.pathname.endsWith('/ar') ? 'ar' : 'en';
  };
  
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  
  // Update language when URL changes
  React.useEffect(() => {
    const newLanguage = getInitialLanguage();
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      updateDocumentAttributes(newLanguage);
    }
  }, [location.pathname]);
  
  const updateDocumentAttributes = (lang: Language) => {
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update document title based on language
    const title = document.querySelector('title');
    if (title && title.hasAttribute('data-default')) {
      title.textContent = lang === 'ar' ? 'منصة حلول الذكاء الاصطناعي' : 'GO AI HUB';
    }
  };
  
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    updateDocumentAttributes(newLanguage);
    
    // Update URL to reflect language change
    const currentPath = location.pathname;
    const currentUrl = `${window.location.origin}${currentPath}`;
    let newPath: string;
    
    if (newLanguage === 'ar') {
      // Add /ar suffix if not already present
      newPath = currentPath.endsWith('/ar') ? currentPath : `${currentPath}/ar`;
    } else {
      // Remove /ar suffix if present
      newPath = currentPath.endsWith('/ar') ? currentPath.slice(0, -3) : currentPath;
    }
    
    // Ensure path doesn't end with double slashes
    newPath = newPath.replace(/\/+$/, '') || '/';
    const newUrl = `${window.location.origin}${newPath}`;
    
    // Navigate to new path if it's different
    if (newUrl !== currentUrl) {
      navigate(newPath, { replace: true });
    }
  };
  
  // Initialize document attributes on mount
  React.useEffect(() => {
    updateDocumentAttributes(language);
  }, []);
  
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