// Translation service using LibreTranslate API
const LIBRETRANSLATE_URL = 'https://goaihub.ai/trans/translate';

export interface TranslationRequest {
  q: string;
  source: string;
  target: string;
  format?: 'text' | 'html';
}

export interface TranslationResponse {
  translatedText: string;
}

export interface TranslationCache {
  [key: string]: string;
}

// In-memory cache for translations to avoid repeated API calls
const translationCache: TranslationCache = {};

// Generate cache key for translation
function getCacheKey(text: string, source: string, target: string): string {
  return `${source}-${target}-${btoa(text.substring(0, 100))}`;
}

// Main translation function
export async function translateText(
  text: string,
  targetLanguage: 'ar' | 'en',
  sourceLanguage: 'auto' | 'ar' | 'en' = 'auto'
): Promise<string> {
  // Return original text if it's empty or if target is same as source
  if (!text || !text.trim()) return text;
  if (sourceLanguage === targetLanguage) return text;

  const cacheKey = getCacheKey(text, sourceLanguage, targetLanguage);
  
  // Check cache first
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      } as TranslationRequest),
    });

    if (!response.ok) {
      console.warn(`Translation API error: ${response.status} ${response.statusText}`);
      return text; // Return original text on error
    }

    const data: TranslationResponse = await response.json();
    const translatedText = data.translatedText || text;

    // Cache the translation
    translationCache[cacheKey] = translatedText;

    return translatedText;
  } catch (error) {
    console.warn('Translation error:', error);
    return text; // Return original text on error
  }
}

// Batch translation function for multiple texts
export async function translateTexts(
  texts: string[],
  targetLanguage: 'ar' | 'en',
  sourceLanguage: 'auto' | 'ar' | 'en' = 'auto'
): Promise<string[]> {
  const translations = await Promise.allSettled(
    texts.map(text => translateText(text, targetLanguage, sourceLanguage))
  );

  return translations.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.warn(`Translation failed for text ${index}:`, result.reason);
      return texts[index]; // Return original text on error
    }
  });
}

// Translate solution object
export async function translateSolution(
  solution: any,
  targetLanguage: 'ar' | 'en'
): Promise<any> {
  try {
    const fieldsToTranslate = [
      'solution_name',
      'summary',
      'description',
      'clients',
      'ksa_customization_details'
    ];

    const translatedFields: { [key: string]: string } = {};

    // Translate each field
    for (const field of fieldsToTranslate) {
      if (solution[field] && typeof solution[field] === 'string') {
        translatedFields[field] = await translateText(
          solution[field],
          targetLanguage
        );
      }
    }

    return {
      ...solution,
      ...translatedFields,
      _isTranslated: true,
      _translatedTo: targetLanguage
    };
  } catch (error) {
    console.warn('Error translating solution:', error);
    return solution; // Return original solution on error
  }
}

// Translate array of solutions
export async function translateSolutions(
  solutions: any[],
  targetLanguage: 'ar' | 'en'
): Promise<any[]> {
  const batchSize = 5; // Process in batches to avoid overwhelming the API
  const translatedSolutions = [];

  for (let i = 0; i < solutions.length; i += batchSize) {
    const batch = solutions.slice(i, i + batchSize);
    const batchTranslations = await Promise.allSettled(
      batch.map(solution => translateSolution(solution, targetLanguage))
    );

    const batchResults = batchTranslations.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.warn(`Translation failed for solution ${i + index}:`, result.reason);
        return batch[index]; // Return original solution on error
      }
    });

    translatedSolutions.push(...batchResults);
  }

  return translatedSolutions;
}

// Clear translation cache (useful for memory management)
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
}

// Get cache statistics
export function getTranslationCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: Object.keys(translationCache).length,
    keys: Object.keys(translationCache)
  };
}