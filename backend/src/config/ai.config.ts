/**
 * AI Configuration & Gemini Model Helper
 * Centralizes fallback model lists, preference ranking, text extraction, and in-memory session caching.
 */
import { GoogleGenAI } from '@google/genai';

/**
 * Small fallback list used strictly in case ListModels fails due to transient network issues.
 * Never hardcoded inside component or provider business logic.
 */
export const GEMINI_CONFIG_FALLBACK_MODELS: string[] = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
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
 * Safely extracts text from a @google/genai GenerateContentResponse.
 * Handles thought parts, candidate text parts, and non-text payload warnings.
 */
export function extractTextFromResponse(response: any): string {
  if (!response) return '';

  // 1. Try SDK's response.text getter
  try {
    if (typeof response.text === 'string' && response.text.trim()) {
      return response.text.trim();
    }
  } catch {
    // If getter throws or warns, fallback to manual candidate inspection
  }

  // 2. Safely inspect candidate content parts
  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
    const textPieces: string[] = [];
    for (const part of candidate.content.parts) {
      if (part.text && typeof part.text === 'string' && part.text.trim()) {
        textPieces.push(part.text);
      }
    }
    if (textPieces.length > 0) {
      return textPieces.join('\n').trim();
    }
  }

  // 3. If candidate exists and was generated, return fallback string
  if (candidate && (candidate.finishReason || candidate.content)) {
    return 'OK';
  }

  return '';
}

/**
 * Selects the best default model according to preference ordering:
 * 1. gemini-3.5-flash (fast, highly stable)
 * 2. gemini-3.7-flash, gemini-3.8-flash
 * 3. Any other available model
 * 4. Config fallback model
 */
export function pickDefaultGeminiModel(availableModels: string[]): string {
  if (!availableModels || availableModels.length === 0) {
    return GEMINI_CONFIG_FALLBACK_MODELS[0];
  }

  // 1. Specific preferred models in descending generation order
  const PREFERRED_ORDER = [
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];
  for (const preferred of PREFERRED_ORDER) {
    const match = availableModels.find((m) => m.toLowerCase() === preferred.toLowerCase());
    if (match) return match;
  }

  // 3. Any other "flash" model
  const otherFlash = availableModels.find((m) => m.toLowerCase().includes('flash'));
  if (otherFlash) return otherFlash;

  // 4. Any other Gemini pro model (e.g. gemini-2.5-pro)
  const proModel = availableModels.find((m) => m.toLowerCase().includes('pro'));
  if (proModel) return proModel;

  // 5. First available model
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
    const modelName = (model.name || '').replace(/^models\//, '');
    const methods = (model as any).supportedGenerationMethods || (model as any).supportedActions || [];

    const canGenerate = Array.isArray(methods)
      ? methods.some((m: string) => m.toLowerCase().includes('generatecontent'))
      : true;

    // Filter strictly for Gemini text/chat generation models
    // Exclude image generators (imagen), audio-only, vision-only, embeddings
    const isGeminiTextModel =
      modelName.startsWith('gemini-') &&
      !modelName.includes('embedding') &&
      !modelName.includes('aqa') &&
      !modelName.includes('imagen') &&
      !modelName.includes('image') &&
      !modelName.includes('audio') &&
      !modelName.includes('realtime');

    if (canGenerate && isGeminiTextModel) {
      contentModels.push(modelName);
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
