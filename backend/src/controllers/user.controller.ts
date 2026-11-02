import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { aiService } from '../services/ai/aiService';
import { getAvailableGeminiModels } from '../config/ai.config';
import { decryptApiKey } from '../utils/encryption';
import prisma from '../config/prisma';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  jobTitle: z.string().optional(),
  defaultSenderName: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  defaultTone: z.string().optional(),
  defaultRecipient: z.string().optional(),
  defaultLength: z.string().optional(),
  customApiKey: z.string().optional(),
  selectedModel: z.string().optional(),
  useDemoMode: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const updated = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const settings = await authService.updateSettings(req.user.id, req.body);
    res.status(200).json(settings);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAIStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await aiService.getAIStatus(req.user?.id);
    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Endpoint to fetch available Gemini models for the current user or key
 */
export const getGeminiModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let key = (req.query.apiKey as string) || '';

    // If key not in query, check logged in user's saved key
    if ((!key || key.includes('****')) && req.user?.id) {
      const userSettings = await prisma.userSettings.findUnique({ where: { userId: req.user.id } });
      if (userSettings?.customApiKey) {
        key = decryptApiKey(userSettings.customApiKey);
      }
    }

    if (!key && process.env.GEMINI_API_KEY) {
      key = process.env.GEMINI_API_KEY;
    }

    if (!key || key.trim().length < 5) {
      res.status(200).json({ models: [], defaultModel: '' });
      return;
    }

    const result = await getAvailableGeminiModels(key);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: mapGeminiError(error) });
  }
};

/**
 * Maps error codes and messages to user-friendly text without raw dumps
 */
export function mapGeminiError(err: any): string {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status || err?.statusCode || 0;

  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    msg.includes('api_key') ||
    msg.includes('api key not valid') ||
    msg.includes('invalid_argument') ||
    msg.includes('unauthenticated') ||
    msg.includes('permission_denied')
  ) {
    return 'Invalid or restricted API key. Check it in Google AI Studio.';
  }

  if (status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('credits')) {
    return 'Rate limit or free-tier quota reached. Try again shortly.';
  }

  if (status === 500 || status === 503 || msg.includes('busy') || msg.includes('overloaded') || msg.includes('internal error')) {
    return 'Google service is busy.';
  }

  if (status === 404 || msg.includes('not found') || msg.includes('not supported')) {
    return 'Model not available.';
  }

  // Prevent raw exception dumps (e.g. SyntaxError, TypeError, stack traces)
  if (
    msg.includes('syntaxerror') ||
    msg.includes('typeerror') ||
    msg.includes('referenceerror') ||
    msg.includes('unexpected token') ||
    msg.includes('json at position') ||
    msg.includes('fetch failed')
  ) {
    return 'Failed to communicate with Google AI service. Please verify your connection and try again.';
  }

  return err?.message || 'Verification failed. Please check your network connection and API key.';
}

export const testApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const { apiKey } = req.body;
  let key = (typeof apiKey === 'string' ? apiKey.trim() : '');

  // If user passed a masked key (contains ****), retrieve the decrypted key from database
  if (key.includes('****') && req.user?.id) {
    const userSettings = await prisma.userSettings.findUnique({ where: { userId: req.user.id } });
    if (userSettings?.customApiKey) {
      key = decryptApiKey(userSettings.customApiKey);
    }
  }

  if (!key || key.length < 5) {
    res.status(400).json({ success: false, error: 'Please provide a valid API key string' });
    return;
  }

  try {
    // =========================================================================
    // 1. Google Gemini (AIza... or AQ... or unknown default to Gemini test)
    // =========================================================================
    if (key.startsWith('AIza') || key.startsWith('AQ.') || key.startsWith('AQ') || (!key.startsWith('gsk_') && !key.startsWith('sk-'))) {
      // Stage (a): ListModels — proves key validity without single-model dependence
      let availableModels: string[] = [];
      let defaultModel: string = '';

      try {
        const modelsResult = await getAvailableGeminiModels(key, true);
        availableModels = modelsResult.models;
        defaultModel = modelsResult.defaultModel;
      } catch (err: any) {
        res.status(400).json({
          success: false,
          stage: 'Stage (a) - ListModels Verification',
          error: mapGeminiError(err),
        });
        return;
      }

      // Stage (b): Lightweight Ping ("Reply with OK")
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: key });

      let activeModel = defaultModel;
      let retried404 = false;
      let pingAttempts = 0;
      let stageBError: any = null;

      while (pingAttempts < 3) {
        pingAttempts++;
        try {
          const testResp = await ai.models.generateContent({
            model: activeModel,
            contents: 'Reply with OK',
          });

          const replyText = testResp.text || '';
          if (!replyText) {
            throw new Error('Received empty response from Gemini model');
          }

          // Stage (a) and (b) both succeeded!
          res.status(200).json({
            success: true,
            provider: `Google Gemini (${activeModel})`,
            activeModel,
            availableModels,
            message: `Google Gemini verified successfully! ${availableModels.length} models ready. Active: ${activeModel}`,
          });
          return;
        } catch (err: any) {
          stageBError = err;
          const errMsg = (err?.message || '').toLowerCase();
          const status = err?.status || err?.statusCode || (errMsg.includes('404') ? 404 : 0);

          // 404 retry: switch to next available model (max 1 retry)
          if ((status === 404 || errMsg.includes('not found')) && !retried404) {
            retried404 = true;
            const fallback = availableModels.find((m) => m !== activeModel);
            if (fallback) {
              console.warn(`[testApiKey] Model ${activeModel} returned 404. Auto-switching to ${fallback} for retry.`);
              activeModel = fallback;
              continue;
            }
          }

          // 500/503 exponential backoff (max 3 attempts)
          if ((status === 500 || status === 503 || errMsg.includes('busy')) && pingAttempts < 3) {
            const delay = Math.pow(2, pingAttempts) * 500;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          break;
        }
      }

      res.status(400).json({
        success: false,
        stage: 'Stage (b) - generateContent Ping',
        error: mapGeminiError(stageBError),
      });
      return;
    }

    // =========================================================================
    // 2. Groq (gsk_...)
    // =========================================================================
    if (key.startsWith('gsk_')) {
      const { OpenAIProvider } = await import('../services/ai/openaiProvider');
      const provider = new OpenAIProvider(key, 'llama-3.3-70b-versatile');
      await provider.draftEmail({
        recipient: 'Colleague',
        purpose: 'Ping',
        context: 'Testing connection',
        tone: 'Professional',
        length: 'Short',
        senderName: 'Test',
      });
      res.status(200).json({
        success: true,
        provider: 'Groq (Llama 3.3 70B)',
        activeModel: 'llama-3.3-70b-versatile',
        availableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
        message: 'Groq API key verified successfully!',
      });
      return;
    }

    // =========================================================================
    // 3. OpenAI (sk-...)
    // =========================================================================
    if (key.startsWith('sk-')) {
      const { OpenAIProvider } = await import('../services/ai/openaiProvider');
      const provider = new OpenAIProvider(key, 'gpt-4o-mini');
      await provider.draftEmail({
        recipient: 'Colleague',
        purpose: 'Ping',
        context: 'Testing connection',
        tone: 'Professional',
        length: 'Short',
        senderName: 'Test',
      });
      res.status(200).json({
        success: true,
        provider: 'OpenAI (GPT-4o-mini)',
        activeModel: 'gpt-4o-mini',
        availableModels: ['gpt-4o-mini', 'gpt-4o'],
        message: 'OpenAI API key verified successfully!',
      });
      return;
    }
  } catch (error: any) {
    let msg = error.message || 'API key failed verification with provider';
    if (msg.includes('429') || msg.includes('credits') || msg.includes('quota') || msg.includes('billing')) {
      msg = 'OpenAI Quota Exceeded (429): Your OpenAI account has no credits remaining. Please add credits at platform.openai.com/settings/organization/billing or switch to a free Google Gemini key or free Groq key.';
    }
    res.status(400).json({
      success: false,
      error: msg,
    });
  }
};
