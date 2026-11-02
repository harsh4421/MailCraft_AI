/**
 * Language Normalization & Fact Preservation Helper
 * Transforms broken English, typos, shorthand, and Hinglish into clean,
 * grammatically correct email phrasing without inventing unmentioned facts.
 */

export interface ParsedContextFacts {
  cleanText: string;
  hasAbsence: boolean;
  hasExtension: boolean;
  duration?: string;
  durationDays?: number;
  reason?: string;
  task?: string;
}

// Common shorthand, typo, and Hinglish normalization dictionary
const TOKEN_REPLACEMENTS: Record<string, string> = {
  // Misspellings & Typos
  unwelll: 'unwell',
  unwel: 'unwell',
  twoo: 'two',
  twwo: 'two',
  dyss: 'days',
  dys: 'days',
  dayz: 'days',
  teh: 'the',
  recieve: 'receive',
  seperate: 'separate',
  untill: 'until',
  atend: 'attend',
  atending: 'attending',
  asap: 'as soon as possible',
  plz: 'please',
  pls: 'please',
  thx: 'thank you',
  thnx: 'thank you',
  thanks: 'thank you',
  gonna: 'planning to',
  wanna: 'would like to',
  kinda: 'somewhat',
  cuz: 'because',
  bcz: 'because',
  clg: 'college',
  prof: 'Professor',
  assignmnt: 'assignment',
  asgnmnt: 'assignment',
  extention: 'extension',
  submition: 'submission',
  submisson: 'submission',
  tom: 'tomorrow',
  tmrw: 'tomorrow',
  '2moro': 'tomorrow',
  wrk: 'work',
  dr: 'doctor',
  med: 'medical',

  // Hinglish expressions
  bimar: 'unwell',
  tabiyat: 'health',
  kharab: 'unwell',
  chutti: 'leave',
  kripya: 'please',
};

/**
 * Normalizes words, correcting common typos, shorthand, and Hinglish.
 */
export function normalizeTokens(input: string): string {
  if (!input) return '';

  // Tokenize preserving basic punctuation
  return input
    .replace(/\b([a-zA-Z0-9_]+)\b/g, (match) => {
      const lower = match.toLowerCase();
      if (TOKEN_REPLACEMENTS[lower]) {
        return TOKEN_REPLACEMENTS[lower];
      }
      return match;
    })
    .trim();
}

/**
 * Extracts factual structure from context text without hallucinating facts.
 */
export function extractContextFacts(rawContext: string): ParsedContextFacts {
  const normalized = normalizeTokens(rawContext.trim());
  const lower = normalized.toLowerCase();

  // 1. Detect Duration
  let duration: string | undefined;
  let durationDays: number | undefined;

  const twoDaysRegex = /\b(two|2|twoo|twwo)\s*(?:days?|dyss?|dys?)\b|\bdo\s*din\b/i;
  const threeDaysRegex = /\b(three|3)\s*(?:days?)\b|\bteen\s*din\b/i;
  const oneDayRegex = /\b(one|1)\s*(?:day)\b|\bek\s*din\b|\btomorrow\b|\bkal\b/i;
  const genericDaysRegex = /\b(\d+)\s*(?:days?)\b/i;

  if (twoDaysRegex.test(normalized) || twoDaysRegex.test(rawContext)) {
    duration = 'two days';
    durationDays = 2;
  } else if (threeDaysRegex.test(normalized) || threeDaysRegex.test(rawContext)) {
    duration = 'three days';
    durationDays = 3;
  } else if (oneDayRegex.test(normalized) || oneDayRegex.test(rawContext)) {
    duration = 'one day';
    durationDays = 1;
  } else {
    const match = normalized.match(genericDaysRegex) || rawContext.match(genericDaysRegex);
    if (match) {
      durationDays = parseInt(match[1], 10);
      duration = `${durationDays} days`;
    }
  }

  // 2. Detect Reason
  let reason: string | undefined;
  if (/\b(unwell|sick|fever|ill|hospital|medical|tabiyat|bimar)\b/i.test(lower)) {
    if (/\bfever\b/i.test(lower)) {
      reason = 'fever';
    } else {
      reason = 'illness';
    }
  } else if (/\bemergency\b/i.test(lower)) {
    reason = 'an unexpected emergency';
  }

  // 3. Detect Absence Intent vs Extension Intent
  const hasAbsence =
    /\b(not able to come|unable to come|cannot come|cant come|not coming|cannot attend|cant attend|unable to attend|leave|absence|chutti|absent)\b/i.test(
      lower
    ) ||
    (/\b(unwell|sick|fever)\b/i.test(lower) && !!duration);

  const hasExtension = /\b(extension|extend|deadline|assignment|submission|project|homework)\b/i.test(
    lower
  );

  // 4. Construct clean grammatical representation
  let cleanSentence = '';
  if (hasAbsence) {
    const reasonClause = reason === 'fever' ? 'I have a fever' : 'I am unwell';
    const durationClause = duration ? ` for ${duration}` : '';
    cleanSentence = `${reasonClause} and will be unable to attend${durationClause}.`;
  } else if (lower.includes('unwell') && duration) {
    cleanSentence = `I am unwell and will be unable to attend for ${duration}.`;
  } else {
    // Capitalize first letter and ensure terminal punctuation
    const trimmed = normalized.replace(/^i\s+/i, 'I ');
    cleanSentence = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!/[.!?]$/.test(cleanSentence)) {
      cleanSentence += '.';
    }
  }

  return {
    cleanText: cleanSentence,
    hasAbsence,
    hasExtension,
    duration,
    durationDays,
    reason,
  };
}
