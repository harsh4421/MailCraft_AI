const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

const SALT = 'mailcraft_ai_salt_secure_2026';
const ALGORITHM = 'aes-256-gcm';

function encryptApiKey(plainText) {
  if (!plainText) return '';
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'mailcraft_default_secure_secret_key_2026';
  const key = crypto.scryptSync(secret, SALT, 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText.trim(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function main() {
  console.log('🌱 Seeding production database...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const encryptedKey = geminiKey ? encryptApiKey(geminiKey) : null;

  // 1. Seed primary user Harsh Kumar
  await prisma.user.upsert({
    where: { email: '2025.kharsh@isu.ac.in' },
    update: {},
    create: {
      email: '2025.kharsh@isu.ac.in',
      passwordHash,
      fullName: 'Harsh Kumar',
      jobTitle: 'Student / Developer',
      defaultSenderName: 'Harsh Kumar',
      settings: {
        create: {
          theme: 'system',
          defaultTone: 'Professional',
          defaultRecipient: 'Professor',
          defaultLength: 'Medium',
          customApiKey: encryptedKey,
          selectedModel: 'gemini-3.5-flash',
          useDemoMode: false,
        },
      },
    },
  });
  console.log('✔ Seeded primary user: 2025.kharsh@isu.ac.in');

  // 2. Seed demo user
  await prisma.user.upsert({
    where: { email: 'demo_user@mailcraft.ai' },
    update: {},
    create: {
      email: 'demo_user@mailcraft.ai',
      passwordHash,
      fullName: 'Harsh Kumar (Demo)',
      jobTitle: 'Reviewer',
      defaultSenderName: 'Harsh Kumar',
      settings: {
        create: {
          theme: 'system',
          defaultTone: 'Professional',
          defaultRecipient: 'Colleague',
          defaultLength: 'Medium',
          customApiKey: encryptedKey,
          selectedModel: 'gemini-3.5-flash',
          useDemoMode: false,
        },
      },
    },
  });
  console.log('✔ Seeded demo user: demo_user@mailcraft.ai');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
