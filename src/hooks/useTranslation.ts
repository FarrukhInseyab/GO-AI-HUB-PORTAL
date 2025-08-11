import { useState, useEffect } from 'react';
import { translateText, translateSolution, translateSolutions } from '../lib/translation';
import { useLanguage } from '../context/LanguageContext';

// Hook for translating a single text
export function useTranslatedText(
  text: string,
  sourceLanguage: 'auto' | 'ar' | 'en' = 'auto'
) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text || sourceLanguage === language) {
      setTranslatedText(text);
      return;
    }

    const translateAsync = async () => {
      setIsTranslating(true);
      setError(null);

      try {
        const translated = await translateText(text, language, sourceLanguage);
        setTranslatedText(translated);
      } catch (err) {
        console.warn('Translation error:', err);
        setError(err instanceof Error ? err.message : 'Translation failed');
        setTranslatedText(text); // Fallback to original text
      } finally {
        setIsTranslating(false);
      }
    };

    translateAsync();
  }, [text, language, sourceLanguage]);

  return { translatedText, isTranslating, error };
}

// Hook for translating a solution object
export function useTranslatedSolution(solution: any) {
  const { language } = useLanguage();
  const [translatedSolution, setTranslatedSolution] = useState(solution);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!solution || solution._translatedTo === language) {
      setTranslatedSolution(solution);
      return;
    }

    const translateAsync = async () => {
      setIsTranslating(true);
      setError(null);

      try {
        const translated = await translateSolution(solution, language);
        setTranslatedSolution(translated);
      } catch (err) {
        console.warn('Solution translation error:', err);
        setError(err instanceof Error ? err.message : 'Translation failed');
        setTranslatedSolution(solution); // Fallback to original solution
      } finally {
        setIsTranslating(false);
      }
    };

    translateAsync();
  }, [solution, language]);

  return { translatedSolution, isTranslating, error };
}

// Hook for translating an array of solutions
export function useTranslatedSolutions(solutions: any[]) {
  const { language } = useLanguage();
  const [translatedSolutions, setTranslatedSolutions] = useState(solutions);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationProgress, setTranslationProgress] = useState(0);

  useEffect(() => {
    if (!solutions || solutions.length === 0) {
      setTranslatedSolutions(solutions);
      setTranslationProgress(0);
      return;
    }

    // Check if solutions are already translated to current language
    const alreadyTranslated = solutions.every(
      solution => solution._translatedTo === language
    );

    if (alreadyTranslated) {
      setTranslatedSolutions(solutions);
      setTranslationProgress(100);
      return;
    }

    const translateAsync = async () => {
      setIsTranslating(true);
      setError(null);
      setTranslationProgress(0);

      try {
        // Show immediate results with original text while translating
        setTranslatedSolutions(solutions);
        
        // Translate in background with progress tracking
        const needsTranslation = solutions.filter(s => s._translatedTo !== language);
        const batchSize = 3;
        const translatedResults = [];
        
        for (let i = 0; i < needsTranslation.length; i += batchSize) {
          const batch = needsTranslation.slice(i, i + batchSize);
          const batchTranslated = await translateSolutions(batch, language);
          translatedResults.push(...batchTranslated);
          
          // Update progress
          const progress = Math.min(100, ((i + batchSize) / needsTranslation.length) * 100);
          setTranslationProgress(progress);
          
          // Update UI with partial results
          const partialResults = solutions.map(solution => {
            if (solution._translatedTo === language) return solution;
            const translated = translatedResults.find(t => t.id === solution.id);
            return translated || solution;
          });
          setTranslatedSolutions(partialResults);
        }
        
        const translated = await translateSolutions(solutions, language);
        setTranslatedSolutions(translated);
        setTranslationProgress(100);
      } catch (err) {
        console.warn('Solutions translation error:', err);
        setError(err instanceof Error ? err.message : 'Translation failed');
        setTranslatedSolutions(solutions); // Fallback to original solutions
        setTranslationProgress(0);
      } finally {
        setIsTranslating(false);
      }
    };

    translateAsync();
  }, [solutions, language]);

  return { translatedSolutions, isTranslating, error, translationProgress };
}

// Hook for translating dynamic content based on detected language
export function useSmartTranslation(
  text: string,
  detectSourceLanguage: boolean = true
) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text) {
      setTranslatedText(text);
      return;
    }

    const translateAsync = async () => {
      setIsTranslating(true);
      setError(null);

      try {
        // Detect if text needs translation
        const sourceLanguage = detectSourceLanguage ? 'auto' : 'en';
        const translated = await translateText(text, language, sourceLanguage);
        
        setTranslatedText(translated);
        if (detectSourceLanguage) {
          // In a real implementation, you might want to detect the source language
          // For now, we'll assume it was detected
          setDetectedLanguage(sourceLanguage);
        }
      } catch (err) {
        console.warn('Smart translation error:', err);
        setError(err instanceof Error ? err.message : 'Translation failed');
        setTranslatedText(text); // Fallback to original text
      } finally {
        setIsTranslating(false);
      }
    };

    translateAsync();
  }, [text, language, detectSourceLanguage]);

  return { 
    translatedText, 
    isTranslating, 
    detectedLanguage, 
    error 
  };
}