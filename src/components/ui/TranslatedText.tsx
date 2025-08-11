import React from 'react';
import { useTranslatedText } from '../../hooks/useTranslation';
import { Loader2, Languages } from 'lucide-react';

interface TranslatedTextProps {
  text: string;
  sourceLanguage?: 'auto' | 'ar' | 'en';
  className?: string;
  showTranslationIndicator?: boolean;
  fallbackToOriginal?: boolean;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  sourceLanguage = 'en',
  className = '',
  showTranslationIndicator = false,
  fallbackToOriginal = true
}) => {
  const { translatedText, isTranslating, error } = useTranslatedText(text, sourceLanguage);

  // Show loading state
  if (isTranslating) {
    return (
      <span className={className}>
        {text}
      </span>
    );
  }

  // Show error state or fallback
  if (error && !fallbackToOriginal) {
    return (
      <span className={`text-red-400 ${className}`}>
        Translation failed
      </span>
    );
  }

  // Show translated text with optional indicator
  return (
    <span className={className}>
      {translatedText}
      {showTranslationIndicator && translatedText !== text && (
        <Languages className="inline h-3 w-3 ml-1 text-primary-500 opacity-60" />
      )}
    </span>
  );
};

export default TranslatedText;