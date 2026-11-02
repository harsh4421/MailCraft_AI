import prisma from '../config/prisma';
import { aiService } from './ai/aiService';
import { DraftEmailParams, RefineEmailParams } from './ai/aiProvider.interface';

export class EmailService {
  public async generateDraft(params: DraftEmailParams, userId?: string) {
    const result = await aiService.draftEmail(params, userId);

    if (result.needsClarification) {
      return result;
    }

    let generationRecord = null;
    if (userId) {
      generationRecord = await prisma.emailGeneration.create({
        data: {
          userId,
          recipient: params.recipient,
          purpose: params.purpose,
          context: params.context,
          tone: params.tone,
          length: params.length,
          senderName: params.senderName,
          additionalInstructions: params.additionalInstructions || null,
          subject: result.subject,
          greeting: result.greeting,
          body: result.body,
          closing: result.closing,
          isDemoMode: result.isDemoMode,
          aiModel: result.aiModel,
        },
      });
    }

    return {
      ...result,
      generationId: generationRecord?.id || null,
    };
  }

  public async refineDraft(params: RefineEmailParams, userId?: string) {
    return await aiService.refineEmail(params, userId);
  }

  public async saveDraft(
    userId: string,
    data: {
      title?: string;
      subject: string;
      recipient: string;
      purpose: string;
      context?: string;
      tone: string;
      body: string;
      generationId?: string;
      tags?: string[];
      isPinned?: boolean;
    }
  ) {
    const title = data.title || data.subject || `${data.purpose} to ${data.recipient}`;

    return await prisma.emailDraft.create({
      data: {
        userId,
        title,
        subject: data.subject,
        recipient: data.recipient,
        purpose: data.purpose,
        context: data.context || null,
        tone: data.tone,
        body: data.body,
        generationId: data.generationId || null,
        tags: data.tags || [],
        isPinned: data.isPinned || false,
      },
    });
  }

  public async getUserDrafts(
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
        { title: { contains: s, mode: 'insensitive' } },
        { subject: { contains: s, mode: 'insensitive' } },
        { body: { contains: s, mode: 'insensitive' } },
        { recipient: { contains: s, mode: 'insensitive' } },
        { purpose: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [drafts, total] = await Promise.all([
      prisma.emailDraft.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.emailDraft.count({ where }),
    ]);

    return {
      drafts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getDraftById(draftId: string, userId: string) {
    const draft = await prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      include: { generation: true },
    });

    if (!draft) {
      throw new Error('Draft not found or access denied.');
    }

    return draft;
  }

  public async updateDraft(
    draftId: string,
    userId: string,
    data: {
      title?: string;
      subject?: string;
      recipient?: string;
      purpose?: string;
      context?: string;
      tone?: string;
      body?: string;
      tags?: string[];
      isPinned?: boolean;
    }
  ) {
    await this.getDraftById(draftId, userId);

    return await prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.recipient !== undefined && { recipient: data.recipient }),
        ...(data.purpose !== undefined && { purpose: data.purpose }),
        ...(data.context !== undefined && { context: data.context }),
        ...(data.tone !== undefined && { tone: data.tone }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      },
    });
  }

  public async deleteDraft(draftId: string, userId: string) {
    await this.getDraftById(draftId, userId);

    await prisma.emailDraft.delete({
      where: { id: draftId },
    });

    return { success: true, message: 'Draft deleted successfully.' };
  }

  public async getUserGenerations(userId: string, limit: number = 20) {
    return await prisma.emailGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(50, limit),
    });
  }
}

export const emailService = new EmailService();
