/**
 * Purpose - Context Conflict Detector
 * Detects discrepancies between selected purpose and user-supplied context,
 * providing structured clarification prompts and options.
 */

import { extractContextFacts } from './languageCleaner';

export interface ConflictClarification {
  needsClarification: boolean;
  clarificationMessage: string;
  clarificationOptions: Array<{
    label: string;
    purpose: string;
    description?: string;
  }>;
  conflictDetected: {
    contextSummary: string;
    detectedIntent: string;
    selectedPurpose: string;
  };
}

export function detectPurposeContextConflict(params: {
  purpose: string;
  context: string;
  confirmedPurpose?: string;
}): ConflictClarification | null {
  const { purpose, context, confirmedPurpose } = params;

  // If user already made a confirmed choice, bypass conflict detection
  if (confirmedPurpose && confirmedPurpose.trim().length > 0) {
    return null;
  }

  const rawContext = context.trim();
  if (rawContext.length < 3) return null;

  const facts = extractContextFacts(rawContext);
  const purpLower = purpose.toLowerCase();

  // Conflict Scenario 1: Selected "Assignment extension", but context describes leave/absence with NO task/assignment
  const isExtensionPurpose = purpLower.includes('extension') || purpLower.includes('assignment');
  if (isExtensionPurpose && facts.hasAbsence && !facts.hasExtension) {
    const durationLabel = facts.duration ? `${facts.duration}` : 'temporary';
    const durationHyphenated = facts.durationDays === 2 ? 'two-day' : facts.duration ? `${facts.duration}` : 'temporary';

    return {
      needsClarification: true,
      clarificationMessage: `Your context describes a ${durationHyphenated} absence. Do you want to request leave or an assignment extension?`,
      clarificationOptions: [
        {
          label: 'Request leave',
          purpose: 'Leave request',
          description: `Generate a concise absence request for ${durationLabel}.`,
        },
        {
          label: 'Request an extension',
          purpose: 'Assignment extension',
          description: `Request an assignment extension citing your ${durationLabel} absence.`,
        },
      ],
      conflictDetected: {
        contextSummary: `${durationHyphenated} absence`,
        detectedIntent: 'Leave request',
        selectedPurpose: purpose,
      },
    };
  }

  // Conflict Scenario 2: Selected "Leave request", but context describes an assignment submission / deadline without absence
  const isLeavePurpose = purpLower.includes('leave');
  if (isLeavePurpose && facts.hasExtension && !facts.hasAbsence) {
    return {
      needsClarification: true,
      clarificationMessage: `Your context mentions an assignment deadline or extension rather than an absence. Do you want to request leave or an assignment extension?`,
      clarificationOptions: [
        {
          label: 'Request leave',
          purpose: 'Leave request',
          description: 'Request formal absence or time off.',
        },
        {
          label: 'Request an extension',
          purpose: 'Assignment extension',
          description: 'Request an extension on your upcoming assignment.',
        },
      ],
      conflictDetected: {
        contextSummary: 'assignment extension details',
        detectedIntent: 'Assignment extension',
        selectedPurpose: purpose,
      },
    };
  }

  return null;
}
