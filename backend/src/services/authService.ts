import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { encryptApiKey, maskApiKey } from '../utils/encryption';

function sanitizeSettings(settings: any) {
  if (!settings) return null;
  return {
    ...settings,
    customApiKey: maskApiKey(settings.customApiKey),
  };
}

export class AuthService {
  private generateToken(user: { id: string; email: string; fullName: string }): string {
    return jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  public async register(data: { email: string; password: string; fullName: string; jobTitle?: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        fullName: data.fullName.trim(),
        jobTitle: data.jobTitle?.trim() || null,
        defaultSenderName: data.fullName.trim(),
        settings: {
          create: {
            theme: 'system',
            defaultTone: 'Professional',
            defaultRecipient: 'Colleague',
            defaultLength: 'Medium',
            useDemoMode: false,
          },
        },
      },
      include: { settings: true },
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        defaultSenderName: user.defaultSenderName,
        settings: sanitizeSettings(user.settings),
        createdAt: user.createdAt,
      },
    };
  }

  public async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      include: { settings: true },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        defaultSenderName: user.defaultSenderName,
        settings: sanitizeSettings(user.settings),
        createdAt: user.createdAt,
      },
    };
  }

  public async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      jobTitle: user.jobTitle,
      defaultSenderName: user.defaultSenderName,
      settings: sanitizeSettings(user.settings),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async updateProfile(
    userId: string,
    data: { fullName?: string; jobTitle?: string; defaultSenderName?: string }
  ) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName && { fullName: data.fullName.trim() }),
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle?.trim() || null }),
        ...(data.defaultSenderName !== undefined && { defaultSenderName: data.defaultSenderName?.trim() || null }),
      },
      include: { settings: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      jobTitle: updated.jobTitle,
      defaultSenderName: updated.defaultSenderName,
      settings: sanitizeSettings(updated.settings),
    };
  }

  public async updateSettings(
    userId: string,
    data: {
      theme?: string;
      defaultTone?: string;
      defaultRecipient?: string;
      defaultLength?: string;
      customApiKey?: string;
      selectedModel?: string;
      useDemoMode?: boolean;
    }
  ) {
    let customApiKeyUpdate: string | null | undefined = undefined;

    if (data.customApiKey !== undefined) {
      const raw = data.customApiKey.trim();
      if (!raw) {
        customApiKeyUpdate = null;
      } else if (!raw.includes('****')) {
        // Only update if not a masked string sent back by client
        customApiKeyUpdate = encryptApiKey(raw);
      }
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.defaultTone !== undefined && { defaultTone: data.defaultTone }),
        ...(data.defaultRecipient !== undefined && { defaultRecipient: data.defaultRecipient }),
        ...(data.defaultLength !== undefined && { defaultLength: data.defaultLength }),
        ...(customApiKeyUpdate !== undefined && { customApiKey: customApiKeyUpdate }),
        ...(data.selectedModel !== undefined && { selectedModel: data.selectedModel }),
        ...(data.useDemoMode !== undefined && { useDemoMode: data.useDemoMode }),
      },
      create: {
        userId,
        theme: data.theme || 'system',
        defaultTone: data.defaultTone || 'Professional',
        defaultRecipient: data.defaultRecipient || 'Colleague',
        defaultLength: data.defaultLength || 'Medium',
        customApiKey: customApiKeyUpdate !== undefined ? customApiKeyUpdate : null,
        selectedModel: data.selectedModel || null,
        useDemoMode: data.useDemoMode ?? false,
      },
    });

    return sanitizeSettings(settings);
  }

  public async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) throw new Error('Current password does not match.');

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPass, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Password successfully updated.' };
  }
}

export const authService = new AuthService();
