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
  useDemoMode: boolean;
}

export interface DraftEmailParams {
  recipient: string;
  purpose: string;
  context: string;
  tone: string;
  length: 'Short' | 'Medium' | 'Detailed' | string;
  senderName: string;
  additionalInstructions?: string;
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
}

export interface IdentifiedMistake {
  id: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'professionalism' | 'context' | 'tone' | 'clarity';
  original: string;
  suggestion: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
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
  detectedTone: string;
  identifiedMistakes: IdentifiedMistake[];
  suggestions: string[];
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
