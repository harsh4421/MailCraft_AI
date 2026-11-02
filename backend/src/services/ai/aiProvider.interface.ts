export interface DraftEmailParams {
  recipient: string;
  purpose: string;
  context: string;
  tone: string;
  length: 'Short' | 'Medium' | 'Detailed' | string;
  senderName: string;
  additionalInstructions?: string;
  confirmedPurpose?: string;
}

export interface RefineEmailParams {
  currentDraft: {
    subject: string;
    greeting: string;
    body: string;
    closing: string;
    senderName: string;
  };
  action: 'makeShorter' | 'makeLonger' | 'changeTone' | 'improveProfessionalism' | 'customInstruction';
  targetTone?: string;
  instruction?: string;
}

export interface DraftEmailResult {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  senderName: string;
  isDemoMode: boolean;
  aiModel: string;
  generationId?: string | null;
  needsClarification?: boolean;
  clarificationMessage?: string;
  clarificationOptions?: Array<{
    label: string;
    purpose: string;
    description?: string;
  }>;
  conflictDetected?: {
    contextSummary: string;
    detectedIntent: string;
    selectedPurpose: string;
  };
}

export interface IdentifiedMistake {
  id: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'professionalism' | 'context' | 'tone' | 'clarity';
  original: string;
  suggestion: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ReviewCriteriaScores {
  clarity: number;         // 1-5
  toneMatch: number;       // 1-5
  completeness: number;    // 1-5
  conciseness: number;     // 1-5
  grammar: number;         // 1-5
  professionalism: number; // 1-5
  actionability: number;   // 1-5
}

export interface ReviewEmailParams {
  originalEmail: string;
  recipient: string;
  purpose: string;
  context?: string;
  desiredTone: string;
}

export interface ReviewEmailResult {
  overallScore: number; // 0-100 scale
  grammarScore: number;
  professionalismScore: number;
  contextScore: number;
  toneScore: number;
  clarityScore: number;
  criteriaScores: ReviewCriteriaScores; // 1-5 scale for the 7 core dimensions
  detectedTone: string;
  identifiedMistakes: IdentifiedMistake[];
  suggestions: string[];
  improvedEmail: string;
  isDemoMode: boolean;
  aiModel: string;
}

export interface IAIProvider {
  name: string;
  draftEmail(params: DraftEmailParams): Promise<DraftEmailResult>;
  refineEmail(params: RefineEmailParams): Promise<DraftEmailResult>;
  reviewEmail(params: ReviewEmailParams): Promise<ReviewEmailResult>;
  isAvailable(): boolean;
}
