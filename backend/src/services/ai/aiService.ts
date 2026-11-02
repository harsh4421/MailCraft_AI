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
import { detectPurposeContextConflict } from '../../utils/conflictDetector';
import { validateAndRepairDraft } from '../../utils/outputValidator';
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

    // Detect Google Gemini (supports legacy AIza..., new AQ., or any key paired with Gemini model/non-OpenAI/Groq prefix)
    if (
      rawKey.startsWith('AIza') ||
      rawKey.startsWith('AQ.') ||
      rawKey.startsWith('AQ') ||
      (preferredModel && preferredModel.startsWith('gemini')) ||
      (!rawKey.startsWith('gsk_') && !rawKey.startsWith('sk-')) ||
      process.env.GEMINI_API_KEY === rawKey
    ) {
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

    // 2. Check environment variables (in test runner, rely on configured user settings or deterministic demoProvider)
    if (process.env.NODE_ENV !== 'test' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
      const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);
      if (gemini.isAvailable()) {
        return { provider: gemini, isDemo: false, modelName: 'Google Gemini (Live API)' };
      }
    }

    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 5) {
      const groq = new OpenAIProvider(process.env.GROQ_API_KEY, 'llama-3.3-70b-versatile');
      if (groq.isAvailable()) {
        return { provider: groq, isDemo: false, modelName: 'Groq (Llama 3.3 70B)' };
      }
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

    // 1. Conflict Check: Purpose - Context Discrepancy
    const conflict = detectPurposeContextConflict({
      purpose: params.purpose,
      context: params.context,
      confirmedPurpose: params.confirmedPurpose,
    });

    if (conflict) {
      return {
        subject: '',
        greeting: '',
        body: '',
        closing: '',
        senderName: params.senderName || 'Harsh Kumar',
        isDemoMode: isDemo,
        aiModel: modelName,
        ...conflict,
      };
    }

    // 2. Execute Provider with Honest Failure Reporting
    try {
      const result = await provider.draftEmail(params);

      // If provider explicitly returned clarification, pass it through
      if (result.needsClarification) {
        return result;
      }

      // 3. Output Validation & Bounded Repair
      const validated = validateAndRepairDraft(result, params.senderName);
      return {
        ...validated.repairedResult,
        isDemoMode: isDemo,
        aiModel: result.aiModel || modelName,
      };
    } catch (error: any) {
      // If user had a custom configured live key that failed, do NOT silently mask the failure!
      if (!isDemo) {
        console.error(`[AIService] Live Provider ${modelName} failed:`, error.message);
        throw new Error(
          `[${modelName}] API Error: ${error.message || 'Service Unavailable'}. Please verify your API key in Settings or switch to Demo Mode.`
        );
      }
      throw error;
    }
  }

  public async refineEmail(params: RefineEmailParams, userId?: string): Promise<DraftEmailResult> {
    const { provider, isDemo, modelName } = await this.getProviderForUser(userId);
    try {
      const refined = await provider.refineEmail(params);
      const validated = validateAndRepairDraft(refined, params.currentDraft.senderName);
      return {
        ...validated.repairedResult,
        isDemoMode: isDemo,
        aiModel: refined.aiModel || modelName,
      };
    } catch (error: any) {
      if (!isDemo) {
        console.error(`[AIService] Live Refine Provider ${modelName} failed:`, error.message);
        throw new Error(`[${modelName}] Refinement failed: ${error.message}`);
      }
      return await this.demoProvider.refineEmail(params);
    }
  }

  public async reviewEmail(params: ReviewEmailParams, userId?: string): Promise<ReviewEmailResult> {
    const { provider, isDemo, modelName } = await this.getProviderForUser(userId);
    try {
      const result = await provider.reviewEmail(params);
      return {
        ...result,
        isDemoMode: isDemo,
        aiModel: result.aiModel || modelName,
      };
    } catch (error: any) {
      if (!isDemo) {
        console.error(`[AIService] Live Review Provider ${modelName} failed:`, error.message);
        throw new Error(`[${modelName}] Review failed: ${error.message}`);
      }
      return await this.demoProvider.reviewEmail(params);
    }
  }
}

export const aiService = new AIService();

