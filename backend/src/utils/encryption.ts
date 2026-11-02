import crypto from 'crypto';

const SALT = 'mailcraft_ai_salt_secure_2026';
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'mailcraft_default_secure_secret_key_2026';
  return crypto.scryptSync(secret, SALT, 32);
}

/**
 * Encrypts an API key using AES-256-GCM.
 * Formats output as: iv:authTag:ciphertext (all in hex).
 */
export function encryptApiKey(plainText: string): string {
  if (!plainText || typeof plainText !== 'string') return '';
  const trimmed = plainText.trim();
  if (!trimmed) return '';

  // Check if it's already in iv:tag:data hex format
  const parts = trimmed.split(':');
  if (parts.length === 3 && parts.every((p) => /^[0-9a-fA-F]+$/.test(p))) {
    return trimmed;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(trimmed, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an API key that was stored with encryptApiKey.
 * Handles legacy unencrypted strings transparently for backwards compatibility.
 */
export function decryptApiKey(cipherText?: string | null): string {
  if (!cipherText || typeof cipherText !== 'string') return '';
  const trimmed = cipherText.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(':');
  // If not in iv:authTag:ciphertext format, treat as unencrypted legacy key
  if (parts.length !== 3 || !parts.every((p) => /^[0-9a-fA-F]+$/.test(p))) {
    return trimmed;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails, return as-is or fallback
    return trimmed;
  }
}

/**
 * Returns a masked representation of an API key for safe client display (e.g. AIza****4f1a).
 * Never exposes the full key to frontend network responses.
 */
export function maskApiKey(apiKey?: string | null): string {
  if (!apiKey || typeof apiKey !== 'string') return '';
  const raw = decryptApiKey(apiKey);
  if (!raw || raw.length < 6) return '';

  if (raw.length <= 10) {
    return `${raw.slice(0, 2)}****${raw.slice(-2)}`;
  }

  const prefix = raw.slice(0, 4);
  const suffix = raw.slice(-4);
  return `${prefix}****${suffix}`;
}
