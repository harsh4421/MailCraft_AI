/**
 * AI Configuration & Gemini Model Helper
 * Centralizes fallback model lists, preference ranking, and in-memory session caching.
 */
import { GoogleGenAI } from '@google/genai';

/**
 * Small fallback list used strictly in case ListModels fails due to transient network issues.
 * Never hardcoded inside component or provider business logic.
 */
export const GEMINI_CONFIG_FALLBACK_MODELS: string[] = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
];

interface CachedModelList {
  models: string[];
  defaultModel: string;
  cachedAt: number;
}

// In-memory session cache for discovered models per API key hash/prefix
const sessionModelCache = new Map<string, CachedModelList>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Selects the best default model according to preference ordering:
 * 1. gemini-3.8-flash (or any 3.* flash if available)
 * 2. Any other flash model (e.g. gemini-2.5-flash, gemini-2.0-flash)
 * 3. Any other available model
 * 4. Config fallback model
 */
export function pickDefaultGeminiModel(availableModels: string[]): string {
  if (!availableModels || availableModels.length === 0) {
    return GEMINI_CONFIG_FALLBACK_MODELS[0];
  }

  // 1. Preference for gemini-3.8-flash or any 3.x flash
  const gemini3Flash = availableModels.find((m) => /^gemini-3(\.\d+)?-flash/i.test(m));
  if (gemini3Flash) return gemini3Flash;

  // 2. Any other "flash" model (e.g. gemini-2.5-flash, gemini-2.0-flash)
  const otherFlash = availableModels.find((m) => m.toLowerCase().includes('flash'));
  if (otherFlash) return otherFlash;

  // 3. Any other available model (e.g. gemini-2.5-pro or first in list)
  return availableModels[0] || GEMINI_CONFIG_FALLBACK_MODELS[0];
}

/**
 * Fetches available Gemini models supporting generateContent using the official @google/genai SDK.
 * Proves key validity without depending on any single model name.
 * Caches results in-memory for 15 minutes.
 */
export async function getAvailableGeminiModels(
  apiKey: string,
  bypassCache: boolean = false
): Promise<{ models: string[]; defaultModel: string }> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey || cleanKey.length < 5) {
    throw new Error('API key must be at least 5 characters long');
  }

  const cacheKey = cleanKey.length > 12 ? `${cleanKey.slice(0, 6)}_${cleanKey.slice(-6)}` : cleanKey;

  if (!bypassCache) {
    const cached = sessionModelCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return { models: cached.models, defaultModel: cached.defaultModel };
    }
  }

  const ai = new GoogleGenAI({ apiKey: cleanKey });

  const pager = await ai.models.list();
  const contentModels: string[] = [];

  for await (const model of pager) {
    // Model object has name: string (e.g. "models/gemini-2.5-flash") and supportedActions or supportedGenerationMethods
    const modelName = (model.name || '').replace(/^models\//, '');
    const methods = (model as any).supportedGenerationMethods || (model as any).supportedActions || [];

    const canGenerate = Array.isArray(methods)
      ? methods.some((m: string) => m.toLowerCase().includes('generatecontent'))
      : true;

    if (canGenerate && modelName) {
      // Exclude embedding, text-embedding, or vision-only internal models if any
      if (!modelName.includes('embedding') && !modelName.includes('aqa')) {
        contentModels.push(modelName);
      }
    }
  }

  if (contentModels.length === 0) {
    // Fall back to config models
    contentModels.push(...GEMINI_CONFIG_FALLBACK_MODELS);
  }

  // Sort models with preferred ones first
  contentModels.sort((a, b) => {
    const aIsFlash = a.includes('flash') ? 0 : 1;
    const bIsFlash = b.includes('flash') ? 0 : 1;
    if (aIsFlash !== bIsFlash) return aIsFlash - bIsFlash;
    return b.localeCompare(a); // Higher version numbers first
  });

  const defaultModel = pickDefaultGeminiModel(contentModels);

  sessionModelCache.set(cacheKey, {
    models: contentModels,
    defaultModel,
    cachedAt: Date.now(),
  });

  return { models: contentModels, defaultModel };
}

/**
 * Clears the session cache (useful for testing)
 */
export function clearModelSessionCache(): void {
  sessionModelCache.clear();
}
