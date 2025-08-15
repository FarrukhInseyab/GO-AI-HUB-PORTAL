// Translation service using GPT prompts for text translation
import { callOpenAI } from './openai';

// Configuration for translation optimization
const TRANSLATION_CONFIG = {
  batchSize: 3, // Process translations in smaller batches for GPT
  maxConcurrent: 2, // Maximum concurrent translation requests
  timeout: 15000, // Request timeout in milliseconds
  retryAttempts: 2, // Number of retry attempts
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

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

// Main translation function using GPT
export async function translateText(
  text: string,
  targetLanguage: 'ar' | 'en',
  sourceLanguage: 'ar' | 'en' = 'en'
): Promise<string> {
  // Return original text if it's empty or if target is same as source
  if (!text || !text.trim()) return text;
  if (sourceLanguage === targetLanguage) return text;
  
  // Auto-detect source language if not specified
  if (sourceLanguage === 'en' && targetLanguage === 'en') {
    sourceLanguage = 'ar';
  }
  
  // Validate language pair - only support en<->ar
  if (!((sourceLanguage === 'en' && targetLanguage === 'ar') || 
        (sourceLanguage === 'ar' && targetLanguage === 'en'))) {
    console.warn('Translation only supports en<->ar');
    return text;
  }

  const cacheKey = getCacheKey(text, sourceLanguage, targetLanguage);
  
  // Check cache first
  if (translationCache[cacheKey] && isCacheValid(translationCache[cacheKey])) {
    return translationCache[cacheKey].text;
  }

  return new Promise((resolve) => {
    const executeTranslation = async () => {
      try {
        // Create translation prompt based on target language
        const systemPrompt = targetLanguage === 'ar' 
          ? `You are a professional translator. Translate the following English text to Arabic. Provide only the Arabic translation without any additional text, explanations, or formatting. Maintain the original meaning and context while ensuring the translation is natural and culturally appropriate for Arabic speakers.`
          : `You are a professional translator. Translate the following Arabic text to English. Provide only the English translation without any additional text, explanations, or formatting. Maintain the original meaning and context while ensuring the translation is natural and appropriate for English speakers.`;

        const userPrompt = `Translate this text: ${text}`;

        const messages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: userPrompt }
        ];

        const translatedText = await callOpenAI(messages, {
          temperature: 0.3,
          max_tokens: Math.max(text.length * 2, 100) // Ensure enough tokens for translation
        });

        // Clean up the response (remove any extra formatting or explanations)
        const cleanedTranslation = translatedText.trim();

        // Cache the translation with timestamp
        translationCache[cacheKey] = {
          text: cleanedTranslation,
          timestamp: Date.now()
        };

        resolve(cleanedTranslation);
      } catch (error) {
        console.warn('GPT translation error:', error);
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
  sourceLanguage: 'ar' | 'en' = 'en'
): Promise<string[]> {
  // Process in batches to avoid overwhelming the API
  const results: string[] = [];
  
  for (let i = 0; i < texts.length; i += TRANSLATION_CONFIG.batchSize) {
    const batch = texts.slice(i, i + TRANSLATION_CONFIG.batchSize);
    
    // For batch translation, use a single GPT call with multiple texts
    try {
      const systemPrompt = targetLanguage === 'ar' 
        ? `You are a professional translator. Translate the following English texts to Arabic. Return the translations in the same order as the input, separated by "|||". Provide only the Arabic translations without any additional text, explanations, or formatting.`
        : `You are a professional translator. Translate the following Arabic texts to English. Return the translations in the same order as the input, separated by "|||". Provide only the English translations without any additional text, explanations, or formatting.`;

      const userPrompt = `Translate these texts:\n${batch.map((text, index) => `${index + 1}. ${text}`).join('\n')}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ];

      const batchTranslation = await callOpenAI(messages, {
        temperature: 0.3,
        max_tokens: Math.max(batch.join(' ').length * 2, 500)
      });

      // Split the batch translation by separator
      const batchResults = batchTranslation.split('|||').map(t => t.trim());
      
      // If we don't get the expected number of results, fall back to individual translations
      if (batchResults.length !== batch.length) {
        console.warn('Batch translation count mismatch, falling back to individual translations');
        const individualResults = await Promise.allSettled(
          batch.map(text => translateText(text, targetLanguage, sourceLanguage))
        );
        
        const fallbackResults = individualResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.warn(`Translation failed for text ${i + index}:`, result.reason);
            return batch[index]; // Return original text on error
          }
        });
        
        results.push(...fallbackResults);
      } else {
        results.push(...batchResults);
      }
    } catch (error) {
      console.warn('Batch translation failed, falling back to individual translations:', error);
      
      // Fallback to individual translations
      const individualResults = await Promise.allSettled(
        batch.map(text => translateText(text, targetLanguage, sourceLanguage))
      );
      
      const fallbackResults = individualResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.warn(`Translation failed for text ${i + index}:`, result.reason);
          return batch[index]; // Return original text on error
        }
      });
      
      results.push(...fallbackResults);
    }
    
    // Small delay between batches to avoid rate limiting
    if (i + TRANSLATION_CONFIG.batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
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

  // Determine source language based on target
  const sourceLanguage = targetLanguage === 'ar' ? 'en' : 'ar';
  
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
    const translatedTexts = await translateTexts(textsToTranslate, targetLanguage, sourceLanguage);
    
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

  const batchSize = 2; // Smaller batches for GPT to ensure quality
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
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < needsTranslation.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
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