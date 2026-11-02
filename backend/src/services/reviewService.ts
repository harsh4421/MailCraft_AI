import prisma from '../config/prisma';
import { aiService } from './ai/aiService';
import { ReviewEmailParams } from './ai/aiProvider.interface';

export class ReviewService {
  public async analyzeEmail(params: ReviewEmailParams, userId?: string) {
    const result = await aiService.reviewEmail(params, userId);

    let reviewRecord: any = null;
    if (userId) {
      reviewRecord = await prisma.emailReview.create({
        data: {
          userId,
          originalEmail: params.originalEmail,
          recipient: params.recipient,
          purpose: params.purpose,
          context: params.context || null,
          desiredTone: params.desiredTone,
          overallScore: result.overallScore,
          grammarScore: result.grammarScore,
          professionalismScore: result.professionalismScore,
          contextScore: result.contextScore,
          toneScore: result.toneScore,
          clarityScore: result.clarityScore,
          identifiedMistakes: result.identifiedMistakes as any,
          suggestions: result.suggestions as any,
          improvedEmail: result.improvedEmail,
          isDemoMode: result.isDemoMode,
          aiModel: result.aiModel,
        },
      });
    }

    return {
      ...result,
      reviewId: reviewRecord?.id || null,
      createdAt: reviewRecord?.createdAt || new Date(),
    };
  }

  public async getUserReviews(
    userId: string,
    query?: { search?: string; recipient?: string; purpose?: string; page?: number; limit?: number }
  ) {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.max(1, Math.min(50, query?.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query?.recipient && query.recipient !== 'All') {
      where.recipient = { contains: query.recipient, mode: 'insensitive' };
    }

    if (query?.purpose && query.purpose !== 'All') {
      where.purpose = { contains: query.purpose, mode: 'insensitive' };
    }

    if (query?.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { originalEmail: { contains: s, mode: 'insensitive' } },
        { improvedEmail: { contains: s, mode: 'insensitive' } },
        { recipient: { contains: s, mode: 'insensitive' } },
        { purpose: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.emailReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailReview.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getReviewById(reviewId: string, userId: string) {
    const review = await prisma.emailReview.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new Error('Review record not found or access denied.');
    }

    return review;
  }

  public async deleteReview(reviewId: string, userId: string) {
    await this.getReviewById(reviewId, userId);

    await prisma.emailReview.delete({
      where: { id: reviewId },
    });

    return { success: true, message: 'Review record deleted successfully.' };
  }

  public async getDashboardStats(userId: string) {
    const [totalDrafts, totalReviews, totalGenerations, reviewsList, recentDrafts, recentReviews] = await Promise.all([
      prisma.emailDraft.count({ where: { userId } }),
      prisma.emailReview.count({ where: { userId } }),
      prisma.emailGeneration.count({ where: { userId } }),
      prisma.emailReview.findMany({
        where: { userId },
        select: {
          overallScore: true,
          grammarScore: true,
          professionalismScore: true,
          contextScore: true,
          toneScore: true,
          clarityScore: true,
        },
      }),
      prisma.emailDraft.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.emailReview.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    let avgOverall = 0;
    let avgGrammar = 0;
    let avgProf = 0;
    let avgClarity = 0;

    if (reviewsList.length > 0) {
      avgOverall = Math.round(reviewsList.reduce((acc, r) => acc + r.overallScore, 0) / reviewsList.length);
      avgGrammar = Math.round(reviewsList.reduce((acc, r) => acc + r.grammarScore, 0) / reviewsList.length);
      avgProf = Math.round(reviewsList.reduce((acc, r) => acc + r.professionalismScore, 0) / reviewsList.length);
      avgClarity = Math.round(reviewsList.reduce((acc, r) => acc + r.clarityScore, 0) / reviewsList.length);
    }

    return {
      totalDrafts,
      totalReviews,
      totalGenerations,
      avgOverallScore: avgOverall,
      scoreBreakdown: {
        grammar: avgGrammar,
        professionalism: avgProf,
        clarity: avgClarity,
      },
      recentDrafts,
      recentReviews,
    };
  }
}

export const reviewService = new ReviewService();
