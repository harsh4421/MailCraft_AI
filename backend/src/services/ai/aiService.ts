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
import prisma from '../../config/prisma';

export class AIService {
  private demoProvider: DemoAIProvider;

  constructor() {
    this.demoProvider = new DemoAIProvider();
  }

  private resolveProviderFromKey(apiKey: string): { provider: IAIProvider; name: string } | null {
    const key = apiKey.trim();
    if (!key || key.length < 5) return null;

    // Detect Google Gemini (supports both legacy AIza... and new AQ. format)
    if (key.startsWith('AIza') || key.startsWith('AQ.') || key.startsWith('AQ') || process.env.GEMINI_API_KEY === key) {
      const gemini = new GeminiProvider(key);
      if (gemini.isAvailable()) return { provider: gemini, name: 'Google Gemini' };
    }

    // Detect Groq
    if (key.startsWith('gsk_') || process.env.GROQ_API_KEY === key) {
      const groq = new OpenAIProvider(key, 'llama-3.3-70b-versatile');
      return { provider: groq, name: 'Groq (Llama 3.3 70B)' };
    }

    // Default to OpenAI / OpenAI compatible
    const openAI = new OpenAIProvider(key, 'gpt-4o-mini');
    if (openAI.isAvailable()) {
      return { provider: openAI, name: 'OpenAI GPT-4o-mini' };
    }

    return null;
  }

  private async getProviderForUser(userId?: string): Promise<{ provider: IAIProvider; isDemo: boolean; modelName: string }> {
    // 1. Check if user configured a key in UserSettings
    if (userId) {
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      if (settings?.useDemoMode) {
        return { provider: this.demoProvider, isDemo: true, modelName: this.demoProvider.name };
      }

      if (settings?.customApiKey && settings.customApiKey.trim().length > 5) {
        const resolved = this.resolveProviderFromKey(settings.customApiKey);
        if (resolved) {
          return { provider: resolved.provider, isDemo: false, modelName: resolved.name };
        }
      }
    }

    // 2. Check environment variables
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
      const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);
      if (gemini.isAvailable()) {
        return { provider: gemini, isDemo: false, modelName: 'Google Gemini' };
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
  }> {
    const { isDemo, modelName } = await this.getProviderForUser(userId);

    let hasCustomKey = false;
    if (userId) {
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      hasCustomKey = !!(settings?.customApiKey && settings.customApiKey.trim().length > 5);
    }

    return {
      activeProvider: modelName,
      isDemoMode: isDemo,
      hasCustomKey,
    };
  }

  public async draftEmail(params: DraftEmailParams, userId?: string): Promise<DraftEmailResult> {
    const { provider, isDemo, modelName } = await this.getProviderForUser(userId);
    try {
      const result = await provider.draftEmail(params);
      return {
        ...result,
        aiModel: modelName,
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
        aiModel: modelName,
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
