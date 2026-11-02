import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { emailService } from '../services/emailService';

export const draftSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  context: z.string().min(3, 'Context must provide at least a few words'),
  tone: z.string().default('Professional'),
  length: z.enum(['Short', 'Medium', 'Detailed']).default('Medium'),
  senderName: z.string().default('Harsh Kumar'),
  additionalInstructions: z.string().optional(),
});

export const refineSchema = z.object({
  currentDraft: z.object({
    subject: z.string(),
    greeting: z.string(),
    body: z.string(),
    closing: z.string(),
    senderName: z.string(),
  }),
  action: z.enum(['makeShorter', 'makeLonger', 'changeTone', 'improveProfessionalism', 'customInstruction']),
  targetTone: z.string().optional(),
  instruction: z.string().optional(),
});

export const saveDraftSchema = z.object({
  title: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  recipient: z.string().min(1, 'Recipient is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  context: z.string().optional(),
  tone: z.string().default('Professional'),
  body: z.string().min(1, 'Email body is required'),
  generationId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

export const updateDraftSchema = z.object({
  title: z.string().optional(),
  subject: z.string().optional(),
  recipient: z.string().optional(),
  purpose: z.string().optional(),
  context: z.string().optional(),
  tone: z.string().optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

export const generateDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const result = await emailService.generateDraft(req.body, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate draft' });
  }
};

export const refineDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const result = await emailService.refineDraft(req.body, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to refine draft' });
  }
};

export const saveDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Please log in to save drafts' });
      return;
    }
    const draft = await emailService.saveDraft(req.user.id, req.body);
    res.status(201).json(draft);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to save draft' });
  }
};

export const getDrafts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const { search, recipient, purpose, page, limit } = req.query;
    const result = await emailService.getUserDrafts(req.user.id, {
      search: search as string,
      recipient: recipient as string,
      purpose: purpose as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch drafts' });
  }
};

export const getDraftById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const draft = await emailService.getDraftById(req.params.id, req.user.id);
    res.status(200).json(draft);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Draft not found' });
  }
};

export const updateDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const updated = await emailService.updateDraft(req.params.id, req.user.id, req.body);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update draft' });
  }
};

export const deleteDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const result = await emailService.deleteDraft(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete draft' });
  }
};

export const getGenerations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const generations = await emailService.getUserGenerations(req.user.id);
    res.status(200).json(generations);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch generations' });
  }
};
