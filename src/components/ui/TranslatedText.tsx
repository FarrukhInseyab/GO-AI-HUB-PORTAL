import React from 'react';
import { useTranslatedText } from '../../hooks/useTranslation';
import { Loader2, Languages } from 'lucide-react';

interface TranslatedTextProps {
  text: string;
  sourceLanguage?: 'auto' | 'ar' | 'en';
  className?: string;
  showTranslationIndicator?: boolean;
  fallbackToOriginal?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  sourceLanguage = 'auto',
  className = '',
  showTranslationIndicator = false,
  fallbackToOriginal = true,
  priority = 'normal'
}) => {
  const { translatedText, isTranslating, error } = useTranslatedText(text, sourceLanguage);

  // Show loading state
  if (isTranslating && priority === 'high') {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
        <span className="text-gray-400">{text}</span>
      </span>
    );
  }
  
  // For normal/low priority, show original text while translating
  if (isTranslating && priority !== 'high') {
    return (
      <span className={className}>
        {text}
        <Loader2 className="inline h-3 w-3 ml-1 animate-spin text-primary-500 opacity-60" />
      </span>
    );
  }

  // Show error state or fallback
  if (error && !fallbackToOriginal) {
    return (
      <span className={`text-red-400 ${className}`}>
        {text}
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