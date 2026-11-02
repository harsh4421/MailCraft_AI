export interface User {
  id: string;
  email: string;
  fullName: string;
  jobTitle?: string;
  defaultSenderName?: string;
  createdAt?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  id?: string;
  theme: 'light' | 'dark' | 'system';
  defaultTone: string;
  defaultRecipient: string;
  defaultLength: string;
  customApiKey?: string | null;
  selectedModel?: string | null;
  useDemoMode: boolean;
}

export interface DraftEmailParams {
  recipient: string;
  purpose: string;
  context: string;
  tone: string;
  length: 'Short' | 'Medium' | 'Detailed' | string;
  senderName?: string;
  additionalInstructions?: string;
  confirmedPurpose?: string;
}

export interface ClarificationOption {
  label: string;
  purpose: string;
  description?: string;
}

export interface DraftEmailResult {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  senderName: string;
  generationId?: string | null;
  isDemoMode: boolean;
  aiModel: string;
  needsClarification?: boolean;
  clarificationMessage?: string;
  clarificationOptions?: ClarificationOption[];
  conflictDetected?: {
    contextSummary: string;
    detectedIntent: string;
    selectedPurpose: string;
  };
}

export interface IdentifiedMistake {
  id: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'professionalism' | 'context' | 'tone' | 'clarity';
  category?: string;
  original: string;
  originalText?: string;
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
  reviewId?: string | null;
  overallScore: number;
  grammarScore: number;
  professionalismScore: number;
  contextScore: number;
  toneScore: number;
  clarityScore: number;
  criteriaScores?: ReviewCriteriaScores;
  breakdown?: {
    grammar: number;
    professionalism: number;
    context: number;
    tone: number;
    clarity: number;
  };
  detectedTone: string;
  identifiedMistakes: IdentifiedMistake[];
  mistakes?: IdentifiedMistake[];
  suggestions: string[];
  summary?: string;
  improvedEmail: string;
  isDemoMode: boolean;
  aiModel: string;
  createdAt?: string;
}

export interface EmailDraft {
  id: string;
  userId: string;
  title: string;
  subject: string;
  recipient: string;
  purpose: string;
  context?: string | null;
  tone: string;
  body: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalDrafts: number;
  totalReviews: number;
  totalGenerations: number;
  avgOverallScore: number;
  scoreBreakdown: {
    grammar: number;
    professionalism: number;
    clarity: number;
  };
  recentDrafts: EmailDraft[];
  recentReviews: Array<{
    id: string;
    recipient: string;
    purpose: string;
    overallScore: number;
    createdAt: string;
  }>;
}

export interface AIStatus {
  activeProvider: string;
  isDemoMode: boolean;
  hasCustomKey: boolean;
}
