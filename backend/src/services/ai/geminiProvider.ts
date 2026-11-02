import { GoogleGenAI } from '@google/genai';
import {
  IAIProvider,
  DraftEmailParams,
  DraftEmailResult,
  RefineEmailParams,
  ReviewEmailParams,
  ReviewEmailResult,
  ReviewCriteriaScores,
} from './aiProvider.interface';
import {
  getAvailableGeminiModels,
  pickDefaultGeminiModel,
  GEMINI_CONFIG_FALLBACK_MODELS,
  extractTextFromResponse,
} from '../../config/ai.config';

function cleanAndParseJson<T = any>(text: string): T {
  let cleaned = text.trim();
  // Strip markdown code fences if present (e.g. ```json ... ``` or ``` ...)
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find the first { and last } in case there is surrounding text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned) as T;
}

/**
 * Exponential backoff sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiProvider implements IAIProvider {
  public name = 'Google Gemini';
  private ai: GoogleGenAI | null = null;
  private apiKey: string;
  public modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
    this.modelName = modelName || '';

    if (this.apiKey && this.apiKey.length > 5) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  public isAvailable(): boolean {
    return !!(this.ai && this.apiKey.length > 5);
  }

  /**
   * Resolves the active model: if not explicitly specified, chooses from available models.
   */
  public async resolveActiveModel(): Promise<string> {
    if (this.modelName && this.modelName.length > 0) {
      return this.modelName;
    }
    try {
      const { defaultModel } = await getAvailableGeminiModels(this.apiKey);
      this.modelName = defaultModel;
      return defaultModel;
    } catch {
      this.modelName = GEMINI_CONFIG_FALLBACK_MODELS[0];
      return this.modelName;
    }
  }

  /**
   * Generates content with:
   * - 404 auto-retry (switches to next available model, max 1 retry)
   * - 500/503 exponential backoff (max 3 attempts)
   * - JSON mode handling
   */
  public async generateContentWithResilience(
    prompt: string,
    isJson: boolean = true
  ): Promise<{ text: string; activeModel: string }> {
    if (!this.ai) {
      throw new Error('Gemini API client is not configured.');
    }

    let currentModel = await this.resolveActiveModel();
    let retried404 = false;

    // Outer loop allows exactly 1 model-switch retry if 404 occurs
    while (true) {
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const config: any = {};
          if (isJson) {
            config.responseMimeType = 'application/json';
          }

          const response = await this.ai.models.generateContent({
            model: currentModel,
            contents: prompt,
            config,
          });

          const text = extractTextFromResponse(response);
          if (!text) {
            throw new Error('Empty response received from Gemini.');
          }

          this.modelName = currentModel;
          return { text, activeModel: currentModel };
        } catch (err: any) {
          const errMsg = (err?.message || '').toLowerCase();
          const status = err?.status || err?.statusCode || (errMsg.includes('404') ? 404 : 0);

          // 1. Check for 404 (Model Not Found) - retry ONCE with next candidate model
          if ((status === 404 || errMsg.includes('not found') || errMsg.includes('not supported')) && !retried404) {
            retried404 = true;
            try {
              const { models } = await getAvailableGeminiModels(this.apiKey, true);
              const nextModel = models.find((m) => m !== currentModel) || GEMINI_CONFIG_FALLBACK_MODELS[1];
              console.warn(`[GeminiProvider] 404 on ${currentModel}. Switched to ${nextModel} for retry.`);
              currentModel = nextModel;
              break; // Break inner loop to retry with new model
            } catch {
              currentModel = GEMINI_CONFIG_FALLBACK_MODELS[1];
              break;
            }
          }

          // 2. Check for 500/503 (Server Busy) - retry with exponential backoff up to maxAttempts
          if ((status === 500 || status === 503 || errMsg.includes('busy') || errMsg.includes('overloaded')) && attempts < maxAttempts) {
            const backoffMs = Math.pow(2, attempts) * 500; // 1s, 2s, 4s
            console.warn(`[GeminiProvider] Google service busy (attempt ${attempts}/${maxAttempts}). Retrying in ${backoffMs}ms...`);
            await sleep(backoffMs);
            continue;
          }

          // 3. Rate limit 429
          if (status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
            throw new Error('Rate limit or free-tier quota reached. Try again shortly.');
          }

          // 4. Invalid key
          if (status === 400 || status === 401 || status === 403 || errMsg.includes('api_key') || errMsg.includes('api key not valid')) {
            throw new Error('Invalid or restricted API key. Check it in Google AI Studio.');
          }

          // Fatal or exhausted attempts
          throw err;
        }
      }

      if (!retried404) {
        break;
      }
    }

    throw new Error('Failed to generate content with Gemini.');
  }

  public async draftEmail(params: DraftEmailParams): Promise<DraftEmailResult> {
    const prompt = `You are MailCraft AI's executive communications specialist.
Draft an exceptional, highly polished email matching the user's specific recipient, purpose, context, and tone.

Safety & Ethics Policy:
If the user's request asks for unethical, fraudulent, harassing, phishing, deceptive, or illegal actions, politely and firmly REFUSE to generate the email. In the JSON body, clearly state that MailCraft AI cannot assist with unethical communications, and explain why.

Strict Instructions:
- Respect the requested recipient: "${params.recipient}".
- Tone requested: "${params.tone}".
- Never fabricate dates or facts not in the context.
- Return ONLY valid JSON in this exact structure:
{
  "subject": "string",
  "greeting": "string",
  "body": "string (paragraphs separated by \\n\\n)",
  "closing": "string",
  "senderName": "string"
}

User Parameters:
Recipient: ${params.recipient}
Purpose: ${params.purpose}
Context & Key Details: ${params.context}
Tone: ${params.tone}
Length: ${params.length}
Sender Name: ${params.senderName || '[Your Name]'}
Additional Instructions: ${params.additionalInstructions || 'None'}`;

    let parsed: any;
    let modelUsed = this.modelName;

    try {
      const { text, activeModel } = await this.generateContentWithResilience(prompt, true);
      modelUsed = activeModel;
      parsed = cleanAndParseJson(text);
    } catch (parseErr) {
      // 1-shot retry without JSON enforcement in case schema failed
      const { text, activeModel } = await this.generateContentWithResilience(
        `${prompt}\n\nIMPORTANT: Return ONLY the raw JSON object. Do not wrap in markdown or commentary.`,
        false
      );
      modelUsed = activeModel;
      parsed = cleanAndParseJson(text);
    }

    return {
      subject: parsed.subject || `${params.purpose} - ${params.senderName}`,
      greeting: parsed.greeting || 'Dear Colleague,',
      body: parsed.body || '',
      closing: parsed.closing || 'Sincerely,',
      senderName: parsed.senderName || params.senderName,
      isDemoMode: false,
      aiModel: modelUsed,
    };
  }

  public async refineEmail(params: RefineEmailParams): Promise<DraftEmailResult> {
    const prompt = `You are MailCraft AI's refinement expert. Modify the existing email according to the specified action.

Existing Email:
Subject: ${params.currentDraft.subject}
Greeting: ${params.currentDraft.greeting}
Body:
${params.currentDraft.body}
Closing: ${params.currentDraft.closing}
Sender: ${params.currentDraft.senderName}

Action: ${params.action}
Target Tone: ${params.targetTone || 'N/A'}
Instruction: ${params.instruction || 'N/A'}

Rules:
- Preserve factual meaning while modifying phrasing.
- Return ONLY valid JSON in this exact structure:
{
  "subject": "string",
  "greeting": "string",
  "body": "string",
  "closing": "string",
  "senderName": "string"
}`;

    let parsed: any;
    let modelUsed = this.modelName;

    try {
      const { text, activeModel } = await this.generateContentWithResilience(prompt, true);
      modelUsed = activeModel;
      parsed = cleanAndParseJson(text);
    } catch {
      const { text, activeModel } = await this.generateContentWithResilience(
        `${prompt}\n\nIMPORTANT: Return ONLY valid JSON.`,
        false
      );
      modelUsed = activeModel;
      parsed = cleanAndParseJson(text);
    }

    return {
      subject: parsed.subject || params.currentDraft.subject,
      greeting: parsed.greeting || params.currentDraft.greeting,
      body: parsed.body || params.currentDraft.body,
      closing: parsed.closing || params.currentDraft.closing,
      senderName: parsed.senderName || params.currentDraft.senderName,
      isDemoMode: false,
      aiModel: modelUsed,
    };
  }

  public async reviewEmail(params: ReviewEmailParams): Promise<ReviewEmailResult> {
    const prompt = `You are MailCraft AI's senior executive email reviewer and communications auditor.
Carefully review the provided email against 7 specific quality dimensions.

Evaluate each dimension strictly on a 1 to 5 integer scale:
1. Clarity (1-5): How clear, understandable, and free of ambiguity is the email?
2. Tone match (1-5): How well does the email adhere to the desired tone ("${params.desiredTone}") for the recipient ("${params.recipient}")?
3. Completeness (1-5): Does the email include all necessary background context and purpose details?
4. Conciseness (1-5): Is the email appropriately concise and free of unnecessary fluff or run-on phrasing?
5. Grammar (1-5): Are spelling, punctuation, and grammar correct?
6. Professionalism (1-5): Does the email observe standard business etiquette, greetings, and sign-offs?
7. Actionability (1-5): Is the next step, call-to-action, or response request explicit and actionable?

Identify any specific mistakes in the text (cite the exact substring as "original", provide a "suggestion", an "explanation", and "severity" of "low"|"medium"|"high").
Generate a polished, completely improved version of the email that fixes all flaws while preserving the author's intent.

Return ONLY valid JSON matching this exact structure:
{
  "criteriaScores": {
    "clarity": number (1-5),
    "toneMatch": number (1-5),
    "completeness": number (1-5),
    "conciseness": number (1-5),
    "grammar": number (1-5),
    "professionalism": number (1-5),
    "actionability": number (1-5)
  },
  "detectedTone": "string",
  "identifiedMistakes": [
    {
      "id": "m1",
      "type": "grammar" | "spelling" | "punctuation" | "professionalism" | "context" | "tone" | "clarity",
      "original": "exact substring from email",
      "suggestion": "improved replacement",
      "explanation": "why this should be changed",
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggestions": ["specific actionable advice 1", "specific actionable advice 2"],
  "improvedEmail": "complete rewritten improved email text"
}

Email to Review:
Recipient: ${params.recipient}
Intended Purpose: ${params.purpose}
Context & Background: ${params.context || 'None provided'}
Desired Tone: ${params.desiredTone}

Email Text:
"""
${params.originalEmail}
"""`;

    let parsed: any;
    let modelUsed = this.modelName;

    try {
      const { text, activeModel } = await this.generateContentWithResilience(prompt, true);
      modelUsed = activeModel;
      parsed = cleanAndParseJson(text);
    } catch {
      const { text, activeModel } = await this.generateContentWithResilience(
        `${prompt}\n\nIMPORTANT: Output valid JSON only.`,
        false
      );
      modelUsed = activeModel;
      parsed = cleanAndParseJson(text);
    }

    const c = parsed.criteriaScores || {};
    const criteriaScores: ReviewCriteriaScores = {
      clarity: Math.max(1, Math.min(5, Number(c.clarity) || 4)),
      toneMatch: Math.max(1, Math.min(5, Number(c.toneMatch) || 4)),
      completeness: Math.max(1, Math.min(5, Number(c.completeness) || 4)),
      conciseness: Math.max(1, Math.min(5, Number(c.conciseness) || 4)),
      grammar: Math.max(1, Math.min(5, Number(c.grammar) || 4)),
      professionalism: Math.max(1, Math.min(5, Number(c.professionalism) || 4)),
      actionability: Math.max(1, Math.min(5, Number(c.actionability) || 4)),
    };

    // Calculate overall score (0-100 scale: 7 criteria * max 5 = 35 points)
    const sum =
      criteriaScores.clarity +
      criteriaScores.toneMatch +
      criteriaScores.completeness +
      criteriaScores.conciseness +
      criteriaScores.grammar +
      criteriaScores.professionalism +
      criteriaScores.actionability;
    const overallScore = Math.round((sum / 35) * 100);

    return {
      overallScore,
      grammarScore: criteriaScores.grammar * 20,
      professionalismScore: criteriaScores.professionalism * 20,
      contextScore: criteriaScores.completeness * 20,
      toneScore: criteriaScores.toneMatch * 20,
      clarityScore: criteriaScores.clarity * 20,
      criteriaScores,
      detectedTone: parsed.detectedTone || 'Neutral',
      identifiedMistakes: Array.isArray(parsed.identifiedMistakes) ? parsed.identifiedMistakes : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      improvedEmail: parsed.improvedEmail || params.originalEmail,
      isDemoMode: false,
      aiModel: modelUsed,
    };
  }
}
