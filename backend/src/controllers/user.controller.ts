import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { aiService } from '../services/ai/aiService';

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

export const testApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
    res.status(400).json({ success: false, error: 'Please provide a valid API key string' });
    return;
  }

  const key = apiKey.trim();
  try {
    // 1. Google Gemini (both legacy AIza... and new AQ. format)
    if (key.startsWith('AIza') || key.startsWith('AQ.') || key.startsWith('AQ')) {
      const { GeminiProvider } = await import('../services/ai/geminiProvider');
      const provider = new GeminiProvider(key);
      const testRes = await provider.draftEmail({
        recipient: 'Professor',
        purpose: 'Ping',
        context: 'Testing connection',
        tone: 'Professional',
        length: 'Short',
        senderName: 'Test',
      });
      const activeModel = testRes.aiModel || provider.modelName;
      res.status(200).json({
        success: true,
        provider: `Google Gemini (${activeModel})`,
        message: `Google Gemini API key verified successfully with ${activeModel}!`,
      });
      return;
    }

    // 2. Groq
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
      res.status(200).json({ success: true, provider: 'Groq (Llama 3.3)', message: 'Groq API key verified successfully!' });
      return;
    }

    // 3. OpenAI (sk-...)
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
      res.status(200).json({ success: true, provider: 'OpenAI (GPT-4o-mini)', message: 'OpenAI API key verified successfully!' });
      return;
    }

    // 4. Try Google Gemini first for any unknown prefix, then OpenAI
    try {
      const { GeminiProvider } = await import('../services/ai/geminiProvider');
      const provider = new GeminiProvider(key);
      const testRes = await provider.draftEmail({
        recipient: 'Professor',
        purpose: 'Ping',
        context: 'Testing connection',
        tone: 'Professional',
        length: 'Short',
        senderName: 'Test',
      });
      const activeModel = testRes.aiModel || provider.modelName;
      res.status(200).json({
        success: true,
        provider: `Google Gemini (${activeModel})`,
        message: `Google Gemini API key verified successfully with ${activeModel}!`,
      });
      return;
    } catch {
      // Fallback try OpenAI
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
      res.status(200).json({ success: true, provider: 'OpenAI', message: 'API key verified successfully!' });
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

