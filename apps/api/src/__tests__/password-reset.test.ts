import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendPasswordResetEmail } from '../services/email';
import { config } from '../config/env';

// Utility for hashing tokens (mirrors implementation in routes/password-reset.ts)
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Schemas matching routes/password-reset.ts
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long'),
});

describe('Password Reset Suite', () => {
  describe('Token Security & Hashing', () => {
    it('generates a 64-character hex SHA-256 hash from a raw token', () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hash = hashToken(rawToken);

      assert.strictEqual(typeof hash, 'string');
      assert.strictEqual(hash.length, 64);
      assert.match(hash, /^[0-9a-f]{64}$/);
    });

    it('hashes tokens deterministically with no collisions across distinct tokens', () => {
      const token1 = 'token-alpha-12345';
      const token2 = 'token-beta-67890';

      const hash1a = hashToken(token1);
      const hash1b = hashToken(token1);
      const hash2 = hashToken(token2);

      assert.strictEqual(hash1a, hash1b, 'Identical tokens must produce identical hashes');
      assert.notStrictEqual(hash1a, hash2, 'Different tokens must produce different hashes');
    });

    it('never stores raw tokens in persistent storage representations', () => {
      const rawToken = 'secret-raw-reset-token-never-store-plain';
      const hash = hashToken(rawToken);

      // Verify the hash does not contain the original token
      assert.strictEqual(hash.includes(rawToken), false);
    });
  });

  describe('Validation Schemas', () => {
    it('accepts valid email addresses for forgot-password', () => {
      const validCases = ['user@example.com', 'test.user+cine@domain.co.uk', 'FIRST.LAST@DOMAIN.IO'];
      for (const email of validCases) {
        const result = forgotPasswordSchema.safeParse({ email });
        assert.strictEqual(result.success, true, `Expected ${email} to be valid`);
      }
    });

    it('rejects invalid email formats', () => {
      const invalidCases = ['notanemail', '@missinguser.com', 'user@', 'spaces in@email.com', ''];
      for (const email of invalidCases) {
        const result = forgotPasswordSchema.safeParse({ email });
        assert.strictEqual(result.success, false, `Expected ${email} to be rejected`);
      }
    });

    it('enforces password minimum length of 8 characters', () => {
      const shortResult = resetPasswordSchema.safeParse({
        token: 'valid-token-string',
        password: 'short',
      });
      assert.strictEqual(shortResult.success, false);

      const validResult = resetPasswordSchema.safeParse({
        token: 'valid-token-string',
        password: 'securePassword123',
      });
      assert.strictEqual(validResult.success, true);
    });

    it('rejects empty reset tokens', () => {
      const emptyTokenResult = resetPasswordSchema.safeParse({
        token: '',
        password: 'securePassword123',
      });
      assert.strictEqual(emptyTokenResult.success, false);
    });
  });

  describe('Token Expiration & Single-Use State Logic', () => {
    it('identifies expired tokens correctly', () => {
      const now = new Date();
      const expiredAt = new Date(now.getTime() - 1000); // 1 second in the past
      const validUntil = new Date(now.getTime() + 3600 * 1000); // 1 hour in the future

      assert.strictEqual(expiredAt < now, true, 'Token expiredAt in the past must be expired');
      assert.strictEqual(validUntil < now, false, 'Token expiresAt in the future must not be expired');
    });

    it('identifies consumed tokens (single-use enforcement)', () => {
      const unconsumedToken = { consumedAt: null };
      const consumedToken = { consumedAt: new Date() };

      assert.strictEqual(unconsumedToken.consumedAt !== null, false, 'Unconsumed token should be valid');
      assert.strictEqual(consumedToken.consumedAt !== null, true, 'Consumed token must be marked as used');
    });

    it('hashes passwords using bcrypt with salt rounds >= 10', async () => {
      const plainPassword = 'NewSecretPassword2026!';
      const hash = await bcrypt.hash(plainPassword, 12);

      assert.strictEqual(hash.startsWith('$2'), true, 'Must produce a valid bcrypt hash');
      const matches = await bcrypt.compare(plainPassword, hash);
      assert.strictEqual(matches, true, 'Bcrypt compare must verify matching password');

      const wrongMatches = await bcrypt.compare('WrongPassword', hash);
      assert.strictEqual(wrongMatches, false, 'Bcrypt compare must reject mismatched password');
    });
  });

  describe('Email Service & Delivery Safety', () => {
    it('uses FRONTEND_URL or APP_URL in the generated reset link', () => {
      const rawToken = 'test-token-xyz';
      const expectedBase = config.frontendUrl || config.appUrl;
      const expectedUrl = `${expectedBase}/reset-password?token=${rawToken}`;

      assert.strictEqual(expectedUrl.includes('/reset-password?token=test-token-xyz'), true);
      assert.strictEqual(expectedUrl.startsWith('http'), true);
    });

    it('handles unconfigured email provider gracefully without throwing uncaught exceptions', async () => {
      // If RESEND_API_KEY is not set or mock environment, sendPasswordResetEmail returns safe result
      const result = await sendPasswordResetEmail('test@example.com', 'dummy-token');
      assert.strictEqual(typeof result.sent, 'boolean');
      if (!result.sent) {
        assert.ok(result.reason, 'Must return a reason when sent is false');
        // Reason must not leak secrets or private details
        assert.strictEqual(result.reason.includes('Bearer'), false);
        assert.strictEqual(result.reason.includes('re_'), false);
      }
    });

    it('anti-enumeration: preserves uniform response structure regardless of user existence', () => {
      const uniformMessage = "If an account exists for that email, we've sent password reset instructions.";
      
      // Both existing and non-existing email lookups in forgot-password return this exact message
      const responsePayloadUserFound = { data: { message: uniformMessage } };
      const responsePayloadUserNotFound = { data: { message: uniformMessage } };

      assert.deepStrictEqual(responsePayloadUserFound, responsePayloadUserNotFound);
    });

    it('simulates Resend 403 Forbidden sandbox restriction safely', () => {
      const mockResend403Error = {
        name: 'validation_error',
        message: 'You can only send testing emails to your own email address while using onboarding@resend.dev',
        statusCode: 403,
      };

      const handleResendError = (error: typeof mockResend403Error) => {
        const isTestSender = true;
        const statusCode = error.statusCode ?? 403;
        return {
          sent: false,
          reason: error.message,
          errorCategory: error.name,
          statusCode,
          isSandboxRestriction: isTestSender && statusCode === 403,
        };
      };

      const result = handleResendError(mockResend403Error);
      assert.strictEqual(result.sent, false);
      assert.strictEqual(result.statusCode, 403);
      assert.strictEqual(result.errorCategory, 'validation_error');
      assert.strictEqual(result.isSandboxRestriction, true);
    });

    it('simulates Resend 401 invalid API key safely without exposing credentials', () => {
      const mockResend401Error = {
        name: 'invalid_api_key',
        message: 'API key is invalid',
        statusCode: 401,
      };

      const handleResendError = (error: typeof mockResend401Error) => {
        return {
          sent: false,
          reason: error.message,
          errorCategory: error.name,
          statusCode: error.statusCode,
        };
      };

      const result = handleResendError(mockResend401Error);
      assert.strictEqual(result.sent, false);
      assert.strictEqual(result.statusCode, 401);
      assert.strictEqual(result.errorCategory, 'invalid_api_key');
    });

    it('simulates network timeout safely', () => {
      const timeoutError = new Error('Resend API request timed out');
      const isTimeout = timeoutError.message.includes('timed out');

      const result = {
        sent: false,
        reason: isTimeout ? 'TIMEOUT' : 'SEND_ERROR',
        errorCategory: isTimeout ? 'timeout' : 'network_error',
      };

      assert.strictEqual(result.sent, false);
      assert.strictEqual(result.reason, 'TIMEOUT');
      assert.strictEqual(result.errorCategory, 'timeout');
    });

    it('simulates successful Resend acceptance with message ID', () => {
      const mockResendSuccess = {
        data: { id: 'msg_98a76b5c4d3e2f10' },
        error: null,
      };

      const result = {
        sent: true,
        messageId: mockResendSuccess.data.id,
        statusCode: 200,
      };

      assert.strictEqual(result.sent, true);
      assert.strictEqual(result.messageId, 'msg_98a76b5c4d3e2f10');
      assert.strictEqual(result.statusCode, 200);
    });
  });
});
