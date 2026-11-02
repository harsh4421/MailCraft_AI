/**
 * Output Validator & Bounded Repair Utility
 * Deterministically checks for unresolved placeholders, leaked instructions,
 * malformed raw text, empty fields, and irrelevant filler paragraphs.
 */

import { DraftEmailResult } from '../services/ai/aiProvider.interface';

// Forbidden placeholder pattern matching [Something ...] or [Topic] or [Last Name]
const PLACEHOLDER_REGEX = /\[([A-Za-z0-9_\s/-]+)\]/g;

// Irrelevant generic filler paragraphs that must be scrubbed if detected
const FORBIDDEN_FILLER_PATTERNS = [
  /I have carefully prepared the prerequisites and would welcome the opportunity to discuss any feedback or questions you might have\./gi,
  /I will ensure all pending matters remain organized\./gi,
  /To provide the relevant context:\s*/gi,
];

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  repairedResult: DraftEmailResult;
}

export function validateAndRepairDraft(
  draft: DraftEmailResult,
  senderNameFallback: string = 'Harsh Kumar'
): ValidationReport {
  const errors: string[] = [];

  let { subject, greeting, body, closing, senderName } = draft;

  // 1. Check for empty fields
  if (!subject || !subject.trim()) {
    errors.push('Subject line cannot be empty.');
  }
  if (!greeting || !greeting.trim()) {
    errors.push('Greeting cannot be empty.');
  }
  if (!body || !body.trim()) {
    errors.push('Email body cannot be empty.');
  }
  if (!closing || !closing.trim()) {
    closing = 'Sincerely,';
  }
  if (!senderName || !senderName.trim() || senderName === '[Your Name]') {
    senderName = senderNameFallback;
  }

  // 2. Bounded Repair: Professor [Last Name] -> Dear Professor,
  greeting = greeting
    .replace(/Dear Professor\s*\[(?:Last\s*Name|Name)\]/gi, 'Dear Professor')
    .replace(/Hi\s*\[(?:Manager\s*Name|Name)\]/gi, 'Hello')
    .replace(/Dear\s*\[(?:Manager\s*Name|Client\s*Name|Name)\]/gi, 'Dear Colleague')
    .replace(/Hey\s*\[Name\]/gi, 'Hello');

  // Ensure trailing comma on greeting
  if (!greeting.endsWith(',')) {
    greeting = `${greeting},`;
  }

  // 3. Bounded Repair: Remove placeholders in Subject line
  subject = subject
    .replace(/\s*-\s*\[(?:Course\s*Name|Class\s*Name)\]/gi, '')
    .replace(/\[(?:Course\s*Name|Class\s*Name)\]\s*-\s*/gi, '')
    .replace(/\[(?:Specific\s*Dates|Dates)\]/gi, '')
    .replace(/\[(?:Job\s*Position|Topic|Issue\/Delay|Occasion\/Meeting)\]/gi, '')
    .replace(/\[Your Name\]/gi, senderName)
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Clean trailing dash or separators if any
  subject = subject.replace(/[-–—]\s*$/, '').trim();

  // 4. Scrub Irrelevant Filler from Body
  FORBIDDEN_FILLER_PATTERNS.forEach((pattern) => {
    body = body.replace(pattern, '');
  });

  // Clean up any double blank lines caused by removing filler
  body = body
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join('\n\n');

  // 5. Check for residual unresolved placeholders
  const residualPlaceholders: string[] = [];
  const checkText = `${subject} ${greeting} ${body} ${closing} ${senderName}`;
  let match;
  while ((match = PLACEHOLDER_REGEX.exec(checkText)) !== null) {
    residualPlaceholders.push(match[0]);
  }

  if (residualPlaceholders.length > 0) {
    errors.push(`Unresolved placeholders detected: ${residualPlaceholders.join(', ')}`);
  }

  // 6. Check for undefined / null literal strings
  if (/\b(undefined|null|NaN)\b/i.test(`${subject} ${greeting} ${body}`)) {
    errors.push('Found literal undefined or null tokens in generated content.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    repairedResult: {
      ...draft,
      subject,
      greeting,
      body,
      closing,
      senderName,
    },
  };
}
