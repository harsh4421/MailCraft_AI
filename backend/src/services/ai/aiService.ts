import {
  IAIProvider,
  DraftEmailParams,
  DraftEmailResult,
  RefineEmailParams,
  ReviewEmailParams,
  ReviewEmailResult,
} from './aiProvider.interface';
import { OpenAIProvider } from './openaiProvider';
import { GeminiProvider } from './geminiProvider';
import { DemoAIProvider } from './demoProvider';
import { decryptApiKey } from '../../utils/encryption';
import prisma from '../../config/prisma';

export class AIService {
  private demoProvider: DemoAIProvider;

  constructor() {
    this.demoProvider = new DemoAIProvider();
  }

  private resolveProviderFromKey(
    apiKey: string,
    preferredModel?: string | null
  ): { provider: IAIProvider; name: string } | null {
    const rawKey = decryptApiKey(apiKey).trim();
    if (!rawKey || rawKey.length < 5) return null;

    // Detect Google Gemini (supports both legacy AIza... and new AQ. format)
    if (rawKey.startsWith('AIza') || rawKey.startsWith('AQ.') || rawKey.startsWith('AQ') || process.env.GEMINI_API_KEY === rawKey) {
      const gemini = new GeminiProvider(rawKey, preferredModel || undefined);
      if (gemini.isAvailable()) {
        return { provider: gemini, name: `Google Gemini (${preferredModel || 'Dynamic Auto'})` };
      }
    }

    // Detect Groq
    if (rawKey.startsWith('gsk_') || process.env.GROQ_API_KEY === rawKey) {
      const groq = new OpenAIProvider(rawKey, 'llama-3.3-70b-versatile');
      return { provider: groq, name: 'Groq (Llama 3.3 70B)' };
    }

    // Default to OpenAI / OpenAI compatible
    const openAI = new OpenAIProvider(rawKey, 'gpt-4o-mini');
    if (openAI.isAvailable()) {
      return { provider: openAI, name: 'OpenAI GPT-4o-mini' };
    }

    return null;
  }

  private async getProviderForUser(
    userId?: string
  ): Promise<{ provider: IAIProvider; isDemo: boolean; modelName: string }> {
    // 1. Check if user configured a key in UserSettings
    if (userId) {
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      if (settings?.useDemoMode) {
        return { provider: this.demoProvider, isDemo: true, modelName: this.demoProvider.name };
      }

      if (settings?.customApiKey && settings.customApiKey.trim().length > 5) {
        const resolved = this.resolveProviderFromKey(settings.customApiKey, settings.selectedModel);
        if (resolved) {
          return { provider: resolved.provider, isDemo: false, modelName: resolved.name };
        }
      }
    }

    // 2. Check environment variables
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
      const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);
      if (gemini.isAvailable()) {
        return { provider: gemini, isDemo: false, modelName: 'Google Gemini (Live API)' };
      }
    }

    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 5) {
      const groq = new OpenAIProvider(process.env.GROQ_API_KEY, 'llama-3.3-70b-versatile');
      return { provider: groq, isDemo: false, modelName: 'Groq (Llama 3.3 70B)' };
    }

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 5) {
      const openAI = new OpenAIProvider(process.env.OPENAI_API_KEY, 'gpt-4o-mini');
      if (openAI.isAvailable()) {
        return { provider: openAI, isDemo: false, modelName: 'OpenAI GPT-4o-mini' };
      }
    }

    // 3. Fallback to Demo Engine
    return { provider: this.demoProvider, isDemo: true, modelName: this.demoProvider.name };
  }

  public async getAIStatus(userId?: string): Promise<{
    activeProvider: string;
    isDemoMode: boolean;
    hasCustomKey: boolean;
    selectedModel?: string | null;
  }> {
    const { isDemo, modelName } = await this.getProviderForUser(userId);

    let hasCustomKey = false;
    let selectedModel: string | null = null;
    if (userId) {
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      hasCustomKey = !!(settings?.customApiKey && settings.customApiKey.trim().length > 5);
      selectedModel = settings?.selectedModel || null;
    }

    return {
      activeProvider: modelName,
      isDemoMode: isDemo,
      hasCustomKey,
      selectedModel,
    };
  }

  public async draftEmail(params: DraftEmailParams, userId?: string): Promise<DraftEmailResult> {
    const { provider, isDemo, modelName } = await this.getProviderForUser(userId);
    try {
      const result = await provider.draftEmail(params);
      return {
        ...result,
        aiModel: result.aiModel || modelName,
      };
    } catch (error: any) {
      console.warn(`[AIService] Provider ${modelName} failed (${error.message}). Falling back to Demo Engine.`);
      const result = await this.demoProvider.draftEmail(params);
      return {
        ...result,
        aiModel: `Fallback Demo Engine (Reason: ${error.message || 'API Unavailable'})`,
      };
    }
  }

  public async refineEmail(params: RefineEmailParams, userId?: string): Promise<DraftEmailResult> {
    const { provider } = await this.getProviderForUser(userId);
    try {
      return await provider.refineEmail(params);
    } catch (error: any) {
      console.warn(`[AIService] Refine failed. Falling back to Demo Engine:`, error.message);
      return await this.demoProvider.refineEmail(params);
    }
  }

  public async reviewEmail(params: ReviewEmailParams, userId?: string): Promise<ReviewEmailResult> {
    const { provider, isDemo, modelName } = await this.getProviderForUser(userId);
    try {
      const result = await provider.reviewEmail(params);
      return {
        ...result,
        aiModel: result.aiModel || modelName,
      };
    } catch (error: any) {
      console.warn(`[AIService] Review provider failed (${error.message}). Falling back to Demo Engine.`);
      const result = await this.demoProvider.reviewEmail(params);
      return {
        ...result,
        aiModel: `Fallback Demo Engine (Reason: ${error.message || 'API Unavailable'})`,
      };
    }
  }
}

export const aiService = new AIService();
