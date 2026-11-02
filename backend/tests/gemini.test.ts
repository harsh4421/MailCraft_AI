import { mapGeminiError } from '../src/controllers/user.controller';
import {
  pickDefaultGeminiModel,
  GEMINI_CONFIG_FALLBACK_MODELS,
  clearModelSessionCache,
} from '../src/config/ai.config';
import { encryptApiKey, decryptApiKey, maskApiKey } from '../src/utils/encryption';

describe('Gemini Resilience, Error Mapping, and Model Selection Unit Tests', () => {
  beforeEach(() => {
    clearModelSessionCache();
  });

  describe('Error Mapping (Task 4)', () => {
    it('should map 400, 401, 403 status to user-friendly invalid key message', () => {
      expect(mapGeminiError({ status: 400, message: 'Bad request' })).toBe(
        'Invalid or restricted API key. Check it in Google AI Studio.'
      );
      expect(mapGeminiError({ status: 401, message: 'Unauthenticated' })).toBe(
        'Invalid or restricted API key. Check it in Google AI Studio.'
      );
      expect(mapGeminiError({ status: 403, message: 'Permission denied' })).toBe(
        'Invalid or restricted API key. Check it in Google AI Studio.'
      );
      expect(mapGeminiError({ message: 'API_KEY_INVALID: Please pass a valid API key' })).toBe(
        'Invalid or restricted API key. Check it in Google AI Studio.'
      );
    });

    it('should map 404 status to model not available', () => {
      expect(mapGeminiError({ status: 404, message: 'models/gemini-pro is not found' })).toBe(
        'Model not available.'
      );
      expect(mapGeminiError({ message: 'Resource not found for model gemini-1.5-flash' })).toBe(
        'Model not available.'
      );
    });

    it('should map 429 status or quota exceeded to rate limit friendly message', () => {
      expect(mapGeminiError({ status: 429, message: 'Resource exhausted' })).toBe(
        'Rate limit or free-tier quota reached. Try again shortly.'
      );
      expect(mapGeminiError({ message: 'Quota exceeded for generateContent requests' })).toBe(
        'Rate limit or free-tier quota reached. Try again shortly.'
      );
    });

    it('should map 500 and 503 to Google service is busy', () => {
      expect(mapGeminiError({ status: 500, message: 'Internal Server Error' })).toBe(
        'Google service is busy.'
      );
      expect(mapGeminiError({ status: 503, message: 'Service Unavailable' })).toBe(
        'Google service is busy.'
      );
      expect(mapGeminiError({ message: 'The model is overloaded. Please try again.' })).toBe(
        'Google service is busy.'
      );
    });

    it('should never expose raw stack traces to the user', () => {
      const mapped = mapGeminiError(new Error('SyntaxError: Unexpected token < in JSON at position 0'));
      expect(mapped).not.toContain('SyntaxError: Unexpected token');
    });
  });

  describe('Model Selection Preference Order (Task 3)', () => {
    it('should prefer gemini-3.8-flash if present in available models list', () => {
      const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.5-pro'];
      expect(pickDefaultGeminiModel(models)).toBe('gemini-3.8-flash');
    });

    it('should choose another flash model if 3.8-flash is not present', () => {
      const models = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'];
      expect(pickDefaultGeminiModel(models)).toBe('gemini-2.5-flash');
    });

    it('should choose first available model if no flash model is in the list', () => {
      const models = ['gemini-2.5-pro', 'gemini-custom-pro'];
      expect(pickDefaultGeminiModel(models)).toBe('gemini-2.5-pro');
    });

    it('should fall back to GEMINI_CONFIG_FALLBACK_MODELS if list is empty', () => {
      expect(pickDefaultGeminiModel([])).toBe(GEMINI_CONFIG_FALLBACK_MODELS[0]);
    });
  });

  describe('AES-256-GCM API Key Security & Encryption (Task 6)', () => {
    const rawKey = 'AQ.Ab8RN_TestGeminiStudioKey123456789';

    it('should encrypt a key into iv:authTag:ciphertext format', () => {
      const encrypted = encryptApiKey(rawKey);
      const parts = encrypted.split(':');
      expect(parts.length).toBe(3);
      expect(parts[0].length).toBe(24); // 12-byte IV in hex
      expect(parts[1].length).toBe(32); // 16-byte authTag in hex
      expect(parts[2].length).toBeGreaterThan(0);
      expect(encrypted).not.toContain(rawKey);
    });

    it('should decrypt back to the original key identically', () => {
      const encrypted = encryptApiKey(rawKey);
      const decrypted = decryptApiKey(encrypted);
      expect(decrypted).toBe(rawKey);
    });

    it('should safely mask the key for UI rendering without exposing sensitive characters', () => {
      const masked = maskApiKey(rawKey);
      expect(masked).toBe('AQ.A****6789');
      expect(masked).not.toContain('TestGeminiStudio');
    });

    it('should mask encrypted keys seamlessly', () => {
      const encrypted = encryptApiKey(rawKey);
      const masked = maskApiKey(encrypted);
      expect(masked).toBe('AQ.A****6789');
    });

    it('should handle legacy unencrypted strings transparently', () => {
      const legacyKey = 'AIzaSyD-unencrypted-legacy-key-9999';
      expect(decryptApiKey(legacyKey)).toBe(legacyKey);
      expect(maskApiKey(legacyKey)).toBe('AIza****9999');
    });
  });
});
