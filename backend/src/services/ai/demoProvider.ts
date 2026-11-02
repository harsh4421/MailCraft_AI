import {
  IAIProvider,
  DraftEmailParams,
  DraftEmailResult,
  RefineEmailParams,
  ReviewEmailParams,
  ReviewEmailResult,
  IdentifiedMistake,
} from './aiProvider.interface';

export class DemoAIProvider implements IAIProvider {
  public name = 'MailCraft Deterministic NLP Demo Engine';

  public isAvailable(): boolean {
    return true; // Always available as local fallback
  }

  public async draftEmail(params: DraftEmailParams): Promise<DraftEmailResult> {
    const { recipient, purpose, context, tone, length, senderName, additionalInstructions } = params;

    // Build greeting based on recipient and tone
    let greeting = 'Hello,';
    const recLower = recipient.toLowerCase();
    if (recLower.includes('professor') || recLower.includes('teacher')) {
      greeting = tone === 'Friendly' ? 'Dear Professor,' : 'Dear Professor [Last Name],';
    } else if (recLower.includes('manager') || recLower.includes('boss')) {
      greeting = tone === 'Friendly' ? 'Hi [Manager Name],' : 'Dear [Manager Name],';
    } else if (recLower.includes('hr') || recLower.includes('hiring')) {
      greeting = 'Dear Hiring Manager / HR Team,';
    } else if (recLower.includes('client') || recLower.includes('customer')) {
      greeting = tone === 'Formal' ? 'Dear Valued Client,' : 'Hello [Client Name],';
    } else if (recLower.includes('friend')) {
      greeting = 'Hey [Name],';
    } else {
      greeting = tone === 'Formal' ? `Dear ${recipient},` : `Hi ${recipient},`;
    }

    // Build subject line based on purpose
    let subject = `${purpose} - ${senderName || 'Update'}`;
    const purpLower = purpose.toLowerCase();
    if (purpLower.includes('leave')) {
      subject = `Leave Request: ${senderName || '[Your Name]'} - [Specific Dates]`;
    } else if (purpLower.includes('extension') || purpLower.includes('assignment')) {
      subject = `Request for Assignment Deadline Extension - [Course Name] - ${senderName || '[Your Name]'}`;
    } else if (purpLower.includes('job') || purpLower.includes('application')) {
      subject = `Application for [Job Position] - ${senderName || '[Your Name]'}`;
    } else if (purpLower.includes('meeting')) {
      subject = `Meeting Request: Discussion regarding [Topic] - ${senderName || '[Your Name]'}`;
    } else if (purpLower.includes('follow-up') || purpLower.includes('follow up')) {
      subject = `Follow-Up: [Project/Discussion Name] - Quick Update`;
    } else if (purpLower.includes('apology')) {
      subject = `Sincere Apologies regarding [Issue/Delay]`;
    } else if (purpLower.includes('thank')) {
      subject = `Heartfelt Thank You - [Occasion/Meeting]`;
    } else if (purpLower.includes('proposal')) {
      subject = `Business Proposal: Strategic Collaboration Opportunity`;
    }

    // Craft body based on tone and length
    const cleanContext = context.trim();
    let bodyParagraphs: string[] = [];

    // Opening hook
    if (tone === 'Formal' || tone === 'Professional') {
      bodyParagraphs.push(
        `I hope this email finds you well. I am writing to formally communicate regarding ${purpose.toLowerCase()}.`
      );
    } else if (tone === 'Friendly') {
      bodyParagraphs.push(
        `Hope you're having a productive week! Reaching out to touch base with you concerning ${purpose.toLowerCase()}.`
      );
    } else if (tone === 'Persuasive' || tone === 'Confident') {
      bodyParagraphs.push(
        `I am writing to present a key update regarding ${purpose.toLowerCase()} and discuss high-impact next steps.`
      );
    } else if (tone === 'Apologetic') {
      bodyParagraphs.push(
        `I am writing to address the matter regarding ${purpose.toLowerCase()} and sincerely apologize for any inconvenience caused.`
      );
    } else {
      bodyParagraphs.push(
        `I am writing to inform you regarding ${purpose.toLowerCase()}.`
      );
    }

    // Core context paragraph
    if (cleanContext) {
      bodyParagraphs.push(
        `To provide the relevant context: ${cleanContext}`
      );
    } else {
      bodyParagraphs.push(
        `Specifically, I would like to review the necessary details with you at your earliest convenience to ensure our alignment.`
      );
    }

    // Elaboration if medium or detailed
    if (length === 'Detailed') {
      bodyParagraphs.push(
        `Key points for your review:\n• Timelines & Deliverables: Proceeding as planned, subject to your feedback.\n• Action Required: Please let me know your thoughts or preferred adjustments.\n• Availability: I am available for a brief discussion should you require any additional clarification.`
      );
    } else if (length === 'Medium') {
      bodyParagraphs.push(
        `I have carefully prepared the prerequisites and would welcome the opportunity to discuss any feedback or questions you might have.`
      );
    }

    // Call to action / closing line
    if (purpLower.includes('meeting') || purpLower.includes('interview')) {
      bodyParagraphs.push(
        `Please let me know if you have 15-20 minutes open on your calendar this week. I am happy to accommodate your schedule.`
      );
    } else if (purpLower.includes('extension') || purpLower.includes('leave')) {
      bodyParagraphs.push(
        `Thank you very much for your understanding and consideration regarding this request. I will ensure all pending matters remain organized.`
      );
    } else {
      bodyParagraphs.push(
        `Thank you for your time and guidance. I look forward to hearing your perspective.`
      );
    }

    if (additionalInstructions?.trim()) {
      bodyParagraphs.push(`Note: ${additionalInstructions.trim()}`);
    }

    // Appropriate closing
    let closing = 'Warm regards,';
    if (tone === 'Formal') {
      closing = 'Sincerely,';
    } else if (tone === 'Friendly') {
      closing = 'Best regards,';
    } else if (tone === 'Apologetic') {
      closing = 'With sincere apologies,';
    } else if (tone === 'Confident' || tone === 'Persuasive') {
      closing = 'Respectfully yours,';
    }

    return {
      subject,
      greeting,
      body: bodyParagraphs.join('\n\n'),
      closing,
      senderName: senderName || '[Your Name]',
      isDemoMode: true,
      aiModel: 'MailCraft NLP Engine (Demo Mode)',
    };
  }

  public async refineEmail(params: RefineEmailParams): Promise<DraftEmailResult> {
    const { currentDraft, action, targetTone, instruction } = params;
    let newBody = currentDraft.body;
    let newClosing = currentDraft.closing;
    let newSubject = currentDraft.subject;

    switch (action) {
      case 'makeShorter': {
        const lines = newBody.split('\n\n');
        newBody = lines.slice(0, Math.max(2, lines.length - 1)).join('\n\n');
        break;
      }
      case 'makeLonger': {
        newBody += `\n\nFurthermore, please let me know if there are additional details or documentation I should provide to expedite this process. I will remain actively reachable via email or phone.`;
        break;
      }
      case 'improveProfessionalism': {
        newBody = newBody
          .replace(/\bhey\b/gi, 'Hello')
          .replace(/\basap\b/gi, 'at your earliest convenience')
          .replace(/\bgonna\b/gi, 'planning to')
          .replace(/\bwanna\b/gi, 'would like to')
          .replace(/\bthx\b|\bthanks\b/gi, 'Thank you');
        newClosing = 'Sincerely,';
        break;
      }
      case 'changeTone': {
        if (targetTone === 'Formal') {
          newClosing = 'Sincerely,';
          newBody = `Please accept this formal communication.\n\n` + newBody;
        } else if (targetTone === 'Friendly') {
          newClosing = 'Warm regards,';
          newBody = newBody.replace(/Sincerely,|Respectfully,/gi, '');
        } else if (targetTone === 'Persuasive') {
          newBody += `\n\nI am confident that taking this approach will yield the most effective outcome for our team.`;
        }
        break;
      }
      case 'customInstruction': {
        if (instruction) {
          newBody += `\n\n[Refined per instruction: "${instruction}"]`;
        }
        break;
      }
    }

    return {
      ...currentDraft,
      subject: newSubject,
      body: newBody,
      closing: newClosing,
      isDemoMode: true,
      aiModel: 'MailCraft NLP Engine (Demo Mode)',
    };
  }

  public async reviewEmail(params: ReviewEmailParams): Promise<ReviewEmailResult> {
    const { originalEmail, recipient, purpose, context, desiredTone } = params;
    const text = originalEmail.trim();

    const mistakes: IdentifiedMistake[] = [];
    const suggestions: string[] = [];

    // 1. Analyze Grammar and Spelling (exact word boundary regex)
    const lowercasePatterns: Array<{ regex: RegExp; fix: string; reason: string; type: IdentifiedMistake['type'] }> = [
      { regex: /\bi\b/g, fix: 'I', reason: 'Capitalize the personal pronoun "I".', type: 'grammar' },
      { regex: /\bteh\b/gi, fix: 'the', reason: 'Spelling error: "teh" should be "the".', type: 'spelling' },
      { regex: /\brecieve\b/gi, fix: 'receive', reason: 'Spelling error: "i" before "e" except after "c".', type: 'spelling' },
      { regex: /\bseperate\b/gi, fix: 'separate', reason: 'Spelling error: "seperate" should be "separate".', type: 'spelling' },
      { regex: /\buntill\b/gi, fix: 'until', reason: 'Spelling error: "untill" has only one "l".', type: 'spelling' },
      { regex: /\bthere\s+car\b/gi, fix: 'their car', reason: 'Incorrect homophone: "their" indicates possession.', type: 'grammar' },
      { regex: /\byour\s+welcome\b/gi, fix: "you're welcome", reason: 'Contraction needed: "you\'re" for "you are".', type: 'grammar' },
    ];

    lowercasePatterns.forEach((p, idx) => {
      const match = text.match(p.regex);
      if (match) {
        mistakes.push({
          id: `grammar-${idx + 1}`,
          type: p.type,
          original: match[0],
          suggestion: p.fix,
          explanation: p.reason,
          severity: 'medium',
        });
      }
    });

    // Punctuation check
    const trimmedEnding = text.replace(/[\s\r\n]+$/, '');
    if (!trimmedEnding.endsWith('.') && !trimmedEnding.endsWith('!') && !trimmedEnding.endsWith('?')) {
      mistakes.push({
        id: 'punct-1',
        type: 'punctuation',
        original: trimmedEnding.slice(-10),
        suggestion: `${trimmedEnding.slice(-10)}.`,
        explanation: 'Email ends without terminal punctuation.',
        severity: 'low',
      });
    }

    // 2. Analyze Professionalism & Slang
    const informalWords = [
      { word: 'gonna', fix: 'planning to', exp: 'Replace conversational slang with standard English.' },
      { word: 'wanna', fix: 'would like to', exp: 'Use professional verbs in corporate correspondence.' },
      { word: 'kinda', fix: 'somewhat', exp: 'Avoid colloquialisms.' },
      { word: 'asap', fix: 'at your earliest convenience', exp: '"ASAP" can sound overly demanding or abrupt.' },
      { word: 'thx', fix: 'thank you', exp: 'Spell out gratitude fully in formal emails.' },
      { word: 'cuz', fix: 'because', exp: 'Avoid texting abbreviations in professional correspondence.' },
      { word: 'u', fix: 'you', exp: 'Avoid single-letter texting shorthands.' },
      { word: 'r', fix: 'are', exp: 'Avoid single-letter shorthands.' },
      { word: 'pls', fix: 'please', exp: 'Spell out polite markers.' },
      { word: 'prof', fix: 'Professor', exp: 'Address faculty with full honorific title.' },
    ];

    informalWords.forEach((item, idx) => {
      const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
      if (regex.test(text)) {
        mistakes.push({
          id: `prof-${idx + 1}`,
          type: 'professionalism',
          original: item.word,
          suggestion: item.fix,
          explanation: item.exp,
          severity: 'high',
        });
      }
    });

    // Check greeting appropriateness
    const firstLine = text.split('\n')[0].toLowerCase();
    const recLower = recipient.toLowerCase();
    const isAcademicOrCorporate = recLower.includes('professor') || recLower.includes('manager') || recLower.includes('hr') || recLower.includes('client');

    if (isAcademicOrCorporate && (firstLine.includes('hey') || firstLine.includes('yo') || firstLine.includes('what\'s up') || firstLine.includes('sup'))) {
      mistakes.push({
        id: 'prof-greeting',
        type: 'professionalism',
        original: text.split('\n')[0],
        suggestion: `Dear ${recipient},`,
        explanation: `Casual greetings like "Hey" are inappropriate when addressing a ${recipient}. Use a respectful salutation.`,
        severity: 'high',
      });
      suggestions.push(`Elevate salutation: Use "Dear ${recipient}" instead of casual openers.`);
    }

    // 3. Analyze Context
    if (context && context.length > 5) {
      const contextKeywords = context.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const missingKeywords = contextKeywords.filter(k => !text.toLowerCase().includes(k));
      if (missingKeywords.length > 3) {
        mistakes.push({
          id: 'ctx-1',
          type: 'context',
          original: '[Missing context details]',
          suggestion: `Incorporate key details: ${missingKeywords.slice(0, 3).join(', ')}`,
          explanation: 'Your email does not seem to mention several critical details provided in the background context.',
          severity: 'medium',
        });
        suggestions.push(`Include concrete details mentioned in your context notes (${missingKeywords.slice(0, 2).join(', ')}).`);
      }
    }

    // Check if purpose is addressed
    if (purpose && !text.toLowerCase().includes(purpose.toLowerCase().slice(0, 4))) {
      suggestions.push(`State the primary objective (${purpose}) explicitly in the first paragraph.`);
    }

    // 4. Analyze Tone
    let detectedTone = 'Neutral';
    if (/asap|need this now|immediately|urgent!/i.test(text)) {
      detectedTone = 'Demanding / Urgent';
    } else if (/sorry|apologize|my bad|regret/i.test(text)) {
      detectedTone = 'Apologetic';
    } else if (/hey|cuz|wanna|cool|awesome|cheers/i.test(text)) {
      detectedTone = 'Casual / Informal';
    } else if (/sincerely|respectfully|kind regards|formally/i.test(text)) {
      detectedTone = 'Formal / Professional';
    }

    if (desiredTone && desiredTone.toLowerCase() !== detectedTone.toLowerCase()) {
      mistakes.push({
        id: 'tone-1',
        type: 'tone',
        original: `Current tone: ${detectedTone}`,
        suggestion: `Align with ${desiredTone} tone`,
        explanation: `The email currently reads as "${detectedTone}", but your target tone is "${desiredTone}".`,
        severity: 'medium',
      });
      suggestions.push(`Calibrate sentence structure to evoke a ${desiredTone.toLowerCase()} tone.`);
    }

    // 5. Analyze Clarity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 28);
    if (longSentences.length > 0) {
      mistakes.push({
        id: 'clarity-1',
        type: 'clarity',
        original: longSentences[0].trim().slice(0, 45) + '...',
        suggestion: 'Break this compound sentence into two concise statements.',
        explanation: 'Sentence is over 28 words long and risks losing clarity for busy readers.',
        severity: 'low',
      });
      suggestions.push('Keep individual sentences under 25 words to maximize reading comprehension.');
    }

    // Calculate Scores based on issues found
    const grammarDeductions = mistakes.filter(m => m.type === 'grammar' || m.type === 'spelling' || m.type === 'punctuation').length * 10;
    const profDeductions = mistakes.filter(m => m.type === 'professionalism').length * 12;
    const contextDeductions = mistakes.filter(m => m.type === 'context').length * 15;
    const toneDeductions = mistakes.filter(m => m.type === 'tone').length * 12;
    const clarityDeductions = mistakes.filter(m => m.type === 'clarity').length * 8;

    const grammarScore = Math.max(50, Math.min(100, 100 - grammarDeductions));
    const professionalismScore = Math.max(45, Math.min(100, 100 - profDeductions));
    const contextScore = Math.max(55, Math.min(100, 100 - contextDeductions));
    const toneScore = Math.max(50, Math.min(100, 100 - toneDeductions));
    const clarityScore = Math.max(60, Math.min(100, 100 - clarityDeductions));

    const overallScore = Math.round(
      (grammarScore * 0.25) +
      (professionalismScore * 0.25) +
      (contextScore * 0.2) +
      (toneScore * 0.15) +
      (clarityScore * 0.15)
    );

    // Build An Eloquent, Fully Improved Rewritten Email
    let salutation = isAcademicOrCorporate ? `Dear ${recipient},` : `Hi ${recipient},`;
    let opening = desiredTone === 'Friendly' 
      ? `I hope you're having a wonderful week.` 
      : `I hope this email finds you well.`;

    let coreReason = '';
    const purpLower = purpose.toLowerCase();
    if (purpLower.includes('extension') || purpLower.includes('assignment')) {
      coreReason = `I am writing to respectfully request an extension on the upcoming assignment deadline. Unfortunately, I was unwell with fever until recently and require a brief extension to finalize my submission to the highest standard.`;
    } else if (purpLower.includes('leave')) {
      coreReason = `I am writing to formally request leave due to an unexpected personal emergency. I have made sure my ongoing responsibilities are organized during my absence.`;
    } else if (purpLower.includes('meeting')) {
      coreReason = `I am writing to request a brief meeting at your convenience to discuss the key deliverables and outline our next steps.`;
    } else if (purpLower.includes('complaint')) {
      coreReason = `I am writing to bring an important issue to your attention regarding recent project deliverables, and to request your assistance in resolving it promptly.`;
    } else {
      coreReason = `I am writing to communicate regarding ${purpose.toLowerCase()}. Please find the relevant details outlined below.`;
    }

    let contextParagraph = context && context.trim().length > 3
      ? `As additional context: ${context.trim()}`
      : `I will ensure all deliverables are completed promptly and appreciate your guidance on this matter.`;

    let closingText = desiredTone === 'Formal' 
      ? `Thank you for your time, consideration, and understanding.\n\nSincerely,\nHarsh Kumar`
      : `Thank you very much for your understanding.\n\nWarm regards,\nHarsh Kumar`;

    const improvedEmail = `${salutation}\n\n${opening}\n\n${coreReason}\n\n${contextParagraph}\n\n${closingText}`;

    if (suggestions.length === 0) {
      suggestions.push('Email structure is sound and clearly structured.');
      suggestions.push('Ensure recipient contact details and subject line are finalized before dispatch.');
    }

    return {
      overallScore,
      grammarScore,
      professionalismScore,
      contextScore,
      toneScore,
      clarityScore,
      detectedTone,
      identifiedMistakes: mistakes,
      suggestions,
      improvedEmail,
      isDemoMode: true,
      aiModel: 'MailCraft NLP Review Engine (Demo Mode)',
    };
  }
}
