import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { reviewService } from '../services/reviewService';

export const reviewSchema = z.object({
  originalEmail: z.string().min(10, 'Please provide an email with at least 10 characters to analyze'),
  recipient: z.string().min(1, 'Recipient is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  context: z.string().optional(),
  desiredTone: z.string().default('Professional'),
});

export const analyzeEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const result = await reviewService.analyzeEmail(req.body, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to analyze email' });
  }
};

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const { search, recipient, purpose, page, limit } = req.query;
    const result = await reviewService.getUserReviews(req.user.id, {
      search: search as string,
      recipient: recipient as string,
      purpose: purpose as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch reviews' });
  }
};

export const getReviewStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const stats = await reviewService.getDashboardStats(req.user.id);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to calculate stats' });
  }
};

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const review = await reviewService.getReviewById(req.params.id, req.user.id);
    res.status(200).json(review);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Review not found' });
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const result = await reviewService.deleteReview(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete review' });
  }
};
