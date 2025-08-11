// Translation service using LibreTranslate API
const LIBRETRANSLATE_URL = 'https://goaihub.ai/trans/translate';

// Configuration for translation optimization
const TRANSLATION_CONFIG = {
  batchSize: 10, // Process translations in batches
  maxConcurrent: 3, // Maximum concurrent translation requests
  timeout: 8000, // Request timeout in milliseconds
  retryAttempts: 2, // Number of retry attempts
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

export interface TranslationRequest {
  q: string;
  source: string;
  target: string;
  format?: 'text' | 'html';
}

export interface TranslationResponse {
  translatedText: string;
}

export interface TranslationCacheEntry {
  text: string;
  timestamp: number;
}

export interface TranslationCache {
  [key: string]: TranslationCacheEntry;
}

// In-memory cache for translations to avoid repeated API calls
const translationCache: TranslationCache = {};

// Queue for managing concurrent requests
let activeRequests = 0;
const requestQueue: Array<() => Promise<void>> = [];

// Process queued requests with concurrency control
async function processQueue() {
  while (requestQueue.length > 0 && activeRequests < TRANSLATION_CONFIG.maxConcurrent) {
    const request = requestQueue.shift();
    if (request) {
      activeRequests++;
      request().finally(() => {
        activeRequests--;
        processQueue();
      });
    }
  }
}

// Generate cache key for translation
function getCacheKey(text: string, source: string, target: string): string {
  return `${source}-${target}-${btoa(text.substring(0, 100))}`;
}

// Check if cache entry is still valid
function isCacheValid(entry: TranslationCacheEntry): boolean {
  return Date.now() - entry.timestamp < TRANSLATION_CONFIG.cacheExpiry;
}

// Clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  Object.keys(translationCache).forEach(key => {
    if (now - translationCache[key].timestamp > TRANSLATION_CONFIG.cacheExpiry) {
      delete translationCache[key];
    }
  });
}

// Periodically clean cache (every hour)
setInterval(cleanExpiredCache, 60 * 60 * 1000);

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
  if (translationCache[cacheKey] && isCacheValid(translationCache[cacheKey])) {
    return translationCache[cacheKey].text;
  }

  return new Promise((resolve) => {
    const executeTranslation = async () => {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TRANSLATION_CONFIG.timeout);

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
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`Translation API error: ${response.status} ${response.statusText}`);
          resolve(text);
          return;
        }

        const data: TranslationResponse = await response.json();
        const translatedText = data.translatedText || text;

        // Cache the translation with timestamp
        translationCache[cacheKey] = {
          text: translatedText,
          timestamp: Date.now()
        };

        resolve(translatedText);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Translation request timed out');
        } else {
          console.warn('Translation error:', error);
        }
        resolve(text); // Return original text on error
      }
    };

    // Add to queue if we're at max concurrency, otherwise execute immediately
    if (activeRequests >= TRANSLATION_CONFIG.maxConcurrent) {
      requestQueue.push(executeTranslation);
    } else {
      executeTranslation();
    }
  });
}

// Batch translation function for multiple texts
export async function translateTexts(
  texts: string[],
  targetLanguage: 'ar' | 'en',
  sourceLanguage: 'auto' | 'ar' | 'en' = 'auto'
): Promise<string[]> {
  // Process in batches to avoid overwhelming the API
  const results: string[] = [];
  
  for (let i = 0; i < texts.length; i += TRANSLATION_CONFIG.batchSize) {
    const batch = texts.slice(i, i + TRANSLATION_CONFIG.batchSize);
    
    const batchTranslations = await Promise.allSettled(
      batch.map(text => translateText(text, targetLanguage, sourceLanguage))
    );

    const batchResults = batchTranslations.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.warn(`Translation failed for text ${i + index}:`, result.reason);
        return batch[index]; // Return original text on error
      }
    });

    results.push(...batchResults);
    
    // Small delay between batches to avoid rate limiting
    if (i + TRANSLATION_CONFIG.batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// Translate solution object
export async function translateSolution(
  solution: any,
  targetLanguage: 'ar' | 'en'
): Promise<any> {
  // Skip if already translated to target language
  if (solution._translatedTo === targetLanguage) {
    return solution;
  }

  try {
    const fieldsToTranslate = [
      'solution_name',
      'summary',
      'description',
      'clients',
      'ksa_customization_details',
      'tech_feedback',
      'business_feedback'
    ];

    // Only translate fields that have content
    const textsToTranslate: string[] = [];
    const fieldMapping: { [index: number]: string } = {};
    let textIndex = 0;

    for (const field of fieldsToTranslate) {
      if (solution[field] && typeof solution[field] === 'string') {
        textsToTranslate.push(solution[field]);
        fieldMapping[textIndex] = field;
        textIndex++;
      }
    }

    // Batch translate all texts
    const translatedTexts = await translateTexts(textsToTranslate, targetLanguage);
    
    // Map translated texts back to fields
    const translatedFields: { [key: string]: string } = {};
    translatedTexts.forEach((translatedText, index) => {
      const fieldName = fieldMapping[index];
      if (fieldName) {
        translatedFields[fieldName] = translatedText;
      }
    });

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
  // Skip if all solutions are already translated
  const needsTranslation = solutions.filter(s => s._translatedTo !== targetLanguage);
  if (needsTranslation.length === 0) {
    return solutions;
  }

  const batchSize = 3; // Smaller batches for better performance
  const translatedSolutions = [];

  for (let i = 0; i < needsTranslation.length; i += batchSize) {
    const batch = needsTranslation.slice(i, i + batchSize);
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
    
    // Small delay between batches
    if (i + batchSize < needsTranslation.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Merge translated solutions with already translated ones
  const result = solutions.map(solution => {
    if (solution._translatedTo === targetLanguage) {
      return solution;
    }
    const translated = translatedSolutions.find(t => t.id === solution.id);
    return translated || solution;
  });

  return result;
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
  memoryUsage: string;
} {
  const cacheSize = Object.keys(translationCache).length;
  const memoryUsage = `${Math.round(JSON.stringify(translationCache).length / 1024)}KB`;
  
  return {
    size: cacheSize,
    keys: Object.keys(translationCache),
    memoryUsage
  };
}