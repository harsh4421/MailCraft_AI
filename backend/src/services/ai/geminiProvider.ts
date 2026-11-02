import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  IAIProvider,
  DraftEmailParams,
  DraftEmailResult,
  RefineEmailParams,
  ReviewEmailParams,
  ReviewEmailResult,
} from './aiProvider.interface';

function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
  'gemini-pro',
];

export class GeminiProvider implements IAIProvider {
  public name = 'Google Gemini';
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string;
  public modelName: string;
  private static resolvedModelCache: Map<string, string> = new Map();

  constructor(apiKey?: string, modelName: string = 'gemini-2.5-flash') {
    this.apiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
    this.modelName = modelName;
    if (this.apiKey && this.apiKey.length > 5) {
      this.client = new GoogleGenerativeAI(this.apiKey);
      // Check if we previously found a working model for this key
      if (GeminiProvider.resolvedModelCache.has(this.apiKey)) {
        this.modelName = GeminiProvider.resolvedModelCache.get(this.apiKey)!;
      }
    }
  }

  public isAvailable(): boolean {
    return !!(this.client && this.apiKey.length > 5);
  }

  /**
   * Discover available models directly from Google's models endpoint
   */
  private async discoverWorkingModel(): Promise<string> {
    if (GeminiProvider.resolvedModelCache.has(this.apiKey)) {
      return GeminiProvider.resolvedModelCache.get(this.apiKey)!;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(this.apiKey)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = (await resp.json()) as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
        if (data.models && Array.isArray(data.models)) {
          const contentModels = data.models
            .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m) => m.name.replace(/^models\//, ''));

          // Match against our prioritized candidates
          for (const candidate of CANDIDATE_MODELS) {
            if (contentModels.includes(candidate)) {
              this.modelName = candidate;
              GeminiProvider.resolvedModelCache.set(this.apiKey, candidate);
              return candidate;
            }
          }

          // If no prioritized candidate matched, pick the first flash or pro model
          const flashOrPro = contentModels.find((m) => m.includes('flash') || m.includes('pro') || m.includes('gemini'));
          if (flashOrPro) {
            this.modelName = flashOrPro;
            GeminiProvider.resolvedModelCache.set(this.apiKey, flashOrPro);
            return flashOrPro;
          }
        }
      }
    } catch {
      // Ignore network or timeout errors during discovery, fallback to sequential trial
    }

    return this.modelName;
  }

  /**
   * Generates content with automatic fallback across supported model names
   */
  private async generateWithFallback(prompt: string): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API client is not configured.');
    }

    await this.discoverWorkingModel();

    const modelsToTry = [
      this.modelName,
      ...CANDIDATE_MODELS.filter((m) => m !== this.modelName),
    ];

    let lastError: any = null;

    for (const modelToAttempt of modelsToTry) {
      try {
        // Try with JSON mode first
        const model = this.client.getGenerativeModel({
          model: modelToAttempt,
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) {
          this.modelName = modelToAttempt;
          GeminiProvider.resolvedModelCache.set(this.apiKey, modelToAttempt);
          return text;
        }
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || '').toLowerCase();

        // If the error is about responseMimeType not being supported, try without JSON mode
        if (msg.includes('responsemimetype') || msg.includes('mime_type') || msg.includes('schemamismatch')) {
          try {
            const fallbackModel = this.client.getGenerativeModel({ model: modelToAttempt });
            const result = await fallbackModel.generateContent(prompt);
            const text = result.response.text();
            if (text) {
              this.modelName = modelToAttempt;
              GeminiProvider.resolvedModelCache.set(this.apiKey, modelToAttempt);
              return text;
            }
          } catch (innerErr) {
            lastError = innerErr;
          }
        }

        // If the error is a 404 (model not found), continue to next model candidate
        if (msg.includes('404') || msg.includes('not found') || msg.includes('not supported')) {
          continue;
        }

        // For other fatal errors (e.g. invalid key 400, quota 429), stop immediately and throw
        throw err;
      }
    }

    throw lastError || new Error(`Failed to generate content with Gemini across candidate models.`);
  }

  public async draftEmail(params: DraftEmailParams): Promise<DraftEmailResult> {
    const prompt = `You are MailCraft AI's executive communications expert.
Draft an exceptional email matching the user's specific recipient, purpose, context, and tone.
Rules:
- Respect the requested recipient and tone strictly.
- Never fabricate dates, commitments, or facts not provided in the context.
- Keep the language natural, concise, and professional.
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
Context: ${params.context}
Tone: ${params.tone}
Length: ${params.length}
Sender Name: ${params.senderName || '[Your Name]'}
Additional Instructions: ${params.additionalInstructions || 'None'}`;

    const text = await this.generateWithFallback(prompt);
    const parsed = cleanAndParseJson(text);

    return {
      subject: parsed.subject || `${params.purpose} - ${params.senderName}`,
      greeting: parsed.greeting || 'Hello,',
      body: parsed.body || '',
      closing: parsed.closing || 'Sincerely,',
      senderName: parsed.senderName || params.senderName,
      isDemoMode: false,
      aiModel: this.modelName,
    };
  }

  public async refineEmail(params: RefineEmailParams): Promise<DraftEmailResult> {
    const prompt = `You are MailCraft AI's email refinement expert. Modify the existing email according to the instruction.
Rules:
- Preserve the core factual meaning.
- Return ONLY valid JSON:
{
  "subject": "string",
  "greeting": "string",
  "body": "string",
  "closing": "string",
  "senderName": "string"
}

Existing Email:
Subject: ${params.currentDraft.subject}
Greeting: ${params.currentDraft.greeting}
Body:
${params.currentDraft.body}
Closing: ${params.currentDraft.closing}
Sender: ${params.currentDraft.senderName}

Action: ${params.action}
Target Tone: ${params.targetTone || 'N/A'}
Instruction: ${params.instruction || 'N/A'}`;

    const text = await this.generateWithFallback(prompt);
    const parsed = cleanAndParseJson(text);

    return {
      subject: parsed.subject || params.currentDraft.subject,
      greeting: parsed.greeting || params.currentDraft.greeting,
      body: parsed.body || params.currentDraft.body,
      closing: parsed.closing || params.currentDraft.closing,
      senderName: parsed.senderName || params.currentDraft.senderName,
      isDemoMode: false,
      aiModel: this.modelName,
    };
  }

  public async reviewEmail(params: ReviewEmailParams): Promise<ReviewEmailResult> {
    const prompt = `You are MailCraft AI's expert email analyst and reviewer.
Analyze the user's email against 5 core criteria:
1. Grammar & Spelling (grammar mistakes, spelling errors, punctuation, run-on sentences)
2. Professionalism (greeting, closing, corporate etiquette, inappropriate slang)
3. Context (missing details, addressing purpose, relevance to recipient)
4. Tone (detected tone, alignment with desired tone)
5. Clarity (confusing phrasing, readability, wordiness)

Do not invent mistakes. Each mistake must cite the actual substring from the email.
Calculate realistic scores out of 100 for each category and an overall score out of 100.
Also produce a complete, polished, improved version of the email.

Return ONLY valid JSON matching this structure:
{
  "overallScore": number (0-100),
  "grammarScore": number (0-100),
  "professionalismScore": number (0-100),
  "contextScore": number (0-100),
  "toneScore": number (0-100),
  "clarityScore": number (0-100),
  "detectedTone": "string",
  "identifiedMistakes": [
    {
      "id": "string",
      "type": "grammar" | "spelling" | "punctuation" | "professionalism" | "context" | "tone" | "clarity",
      "original": "substring from email",
      "suggestion": "string replacement",
      "explanation": "string explaining why",
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggestions": ["string general advice 1", "string general advice 2"],
  "improvedEmail": "complete rewritten email text"
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

    const text = await this.generateWithFallback(prompt);
    const parsed = cleanAndParseJson(text);

    return {
      overallScore: Number(parsed.overallScore) || 85,
      grammarScore: Number(parsed.grammarScore) || 85,
      professionalismScore: Number(parsed.professionalismScore) || 85,
      contextScore: Number(parsed.contextScore) || 85,
      toneScore: Number(parsed.toneScore) || 85,
      clarityScore: Number(parsed.clarityScore) || 85,
      detectedTone: parsed.detectedTone || 'Neutral',
      identifiedMistakes: Array.isArray(parsed.identifiedMistakes) ? parsed.identifiedMistakes : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      improvedEmail: parsed.improvedEmail || params.originalEmail,
      isDemoMode: false,
      aiModel: this.modelName,
    };
  }
}
