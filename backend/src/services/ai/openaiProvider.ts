import OpenAI from 'openai';
import {
  IAIProvider,
  DraftEmailParams,
  DraftEmailResult,
  RefineEmailParams,
  ReviewEmailParams,
  ReviewEmailResult,
} from './aiProvider.interface';

export class OpenAIProvider implements IAIProvider {
  public name = 'OpenAI GPT';
  private client: OpenAI | null = null;
  private apiKey: string;
  private model: string;
  private baseURL?: string;

  constructor(apiKey?: string, model: string = 'gpt-4o-mini', baseURL?: string) {
    this.apiKey = (apiKey || process.env.OPENAI_API_KEY || '').trim();
    this.model = model;

    // Auto-detect Groq keys and set Groq's official OpenAI-compatible endpoint
    if (this.apiKey.startsWith('gsk_') && !baseURL) {
      this.baseURL = 'https://api.groq.com/openai/v1';
      this.name = 'Groq Cloud';
    } else {
      this.baseURL = baseURL;
    }

    if (this.apiKey && this.apiKey.length > 5) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL || undefined,
      });
    }
  }

  public isAvailable(): boolean {
    return !!(this.client && this.apiKey.trim().length > 5);
  }

  public async draftEmail(params: DraftEmailParams): Promise<DraftEmailResult> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured.');
    }

    const systemPrompt = `You are an elite executive communications expert and professional email writing assistant for MailCraft AI.
Draft an exceptional email matching the user's specific recipient, purpose, context, and tone.
Rules:
- Respect the requested recipient and tone strictly.
- Never fabricate dates, commitments, or facts not provided in the context.
- Keep the language natural, concise, and professional.
- Return ONLY valid JSON in the exact structure specified below.

JSON Format:
{
  "subject": "string",
  "greeting": "string",
  "body": "string (paragraphs separated by \\n\\n)",
  "closing": "string",
  "senderName": "string"
}`;

    const userPrompt = `Generate an email with these parameters:
Recipient: ${params.recipient}
Purpose: ${params.purpose}
Context & Key Details: ${params.context}
Tone: ${params.tone}
Length: ${params.length}
Sender Name: ${params.senderName || '[Your Name]'}
Additional Instructions: ${params.additionalInstructions || 'None'}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI.');
    }

    const parsed = JSON.parse(content);
    return {
      subject: parsed.subject || 'Follow-Up',
      greeting: parsed.greeting || 'Hello,',
      body: parsed.body || '',
      closing: parsed.closing || 'Sincerely,',
      senderName: parsed.senderName || params.senderName,
      isDemoMode: false,
      aiModel: this.model,
    };
  }

  public async refineEmail(params: RefineEmailParams): Promise<DraftEmailResult> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured.');
    }

    const systemPrompt = `You are MailCraft AI's email refinement expert. Modify the existing email according to the instruction.
Rules:
- Preserve the core factual meaning.
- Return ONLY valid JSON.

JSON Format:
{
  "subject": "string",
  "greeting": "string",
  "body": "string",
  "closing": "string",
  "senderName": "string"
}`;

    const userPrompt = `Existing Email:
Subject: ${params.currentDraft.subject}
Greeting: ${params.currentDraft.greeting}
Body:
${params.currentDraft.body}
Closing: ${params.currentDraft.closing}
Sender: ${params.currentDraft.senderName}

Action: ${params.action}
Target Tone: ${params.targetTone || 'N/A'}
Instruction: ${params.instruction || 'N/A'}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI.');
    const parsed = JSON.parse(content);

    return {
      subject: parsed.subject || params.currentDraft.subject,
      greeting: parsed.greeting || params.currentDraft.greeting,
      body: parsed.body || params.currentDraft.body,
      closing: parsed.closing || params.currentDraft.closing,
      senderName: parsed.senderName || params.currentDraft.senderName,
      isDemoMode: false,
      aiModel: this.model,
    };
  }

  public async reviewEmail(params: ReviewEmailParams): Promise<ReviewEmailResult> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured.');
    }

    const systemPrompt = `You are MailCraft AI's expert email analyst and reviewer.
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
}`;

    const userPrompt = `Analyze this email:
Recipient: ${params.recipient}
Intended Purpose: ${params.purpose}
Context & Background: ${params.context || 'None provided'}
Desired Tone: ${params.desiredTone}

Email Text to Review:
"""
${params.originalEmail}
"""`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI.');
    const parsed = JSON.parse(content);

    const gScore = Number(parsed.grammarScore) || 85;
    const pScore = Number(parsed.professionalismScore) || 80;
    const cScore = Number(parsed.contextScore) || 80;
    const tScore = Number(parsed.toneScore) || 80;
    const clScore = Number(parsed.clarityScore) || 85;

    const criteriaScores = {
      clarity: Math.max(1, Math.min(5, Math.round(clScore / 20))),
      toneMatch: Math.max(1, Math.min(5, Math.round(tScore / 20))),
      completeness: Math.max(1, Math.min(5, Math.round(cScore / 20))),
      conciseness: Math.max(1, Math.min(5, Math.round(((clScore + cScore) / 2) / 20))),
      grammar: Math.max(1, Math.min(5, Math.round(gScore / 20))),
      professionalism: Math.max(1, Math.min(5, Math.round(pScore / 20))),
      actionability: Math.max(1, Math.min(5, Math.round(((pScore + cScore) / 2) / 20))),
    };

    return {
      overallScore: Number(parsed.overallScore) || 80,
      grammarScore: gScore,
      professionalismScore: pScore,
      contextScore: cScore,
      toneScore: tScore,
      clarityScore: clScore,
      criteriaScores,
      detectedTone: parsed.detectedTone || 'Neutral',
      identifiedMistakes: Array.isArray(parsed.identifiedMistakes) ? parsed.identifiedMistakes : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      improvedEmail: parsed.improvedEmail || params.originalEmail,
      isDemoMode: false,
      aiModel: this.model,
    };
  }
}
