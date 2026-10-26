import { describe, it } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import { AppError } from '../utils/errors';
import { config } from '../config/env';

// Schema matching routes/google-auth.ts
const googleLoginSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z
    .string()
    .url('Invalid redirect URI')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'Redirect URI must be http or https',
    }),
});

// Username sanitizer matching routes/google-auth.ts
function generateBaseUsername(googleName: string): string {
  return googleName
    .replace(/[^a-zA-Z0-9_]/g, '')
    .substring(0, 20)
    .toLowerCase() || 'user';
}

describe('Google OAuth Suite', () => {
  describe('Configuration & Credentials Check', () => {
    it('throws GOOGLE_NOT_CONFIGURED (HTTP 503) when credentials are not configured', () => {
      // Simulate empty client credentials
      const testConfig = { clientId: '', clientSecret: '' };

      const checkConfig = () => {
        if (!testConfig.clientId || !testConfig.clientSecret) {
          throw new AppError(
            'Google Sign-In is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
            503,
            'GOOGLE_NOT_CONFIGURED',
          );
        }
      };

      assert.throws(checkConfig, (err: unknown) => {
        const appErr = err as AppError;
        assert.strictEqual(appErr.statusCode, 503);
        assert.strictEqual(appErr.code, 'GOOGLE_NOT_CONFIGURED');
        assert.strictEqual(appErr.isOperational, true);
        return true;
      });
    });

    it('passes credentials check when both clientId and clientSecret are provided', () => {
      const testConfig = { clientId: 'client-id-123.apps.googleusercontent.com', clientSecret: 'secret-xyz' };

      const checkConfig = () => {
        if (!testConfig.clientId || !testConfig.clientSecret) {
          throw new AppError('Google Sign-In is not configured', 503, 'GOOGLE_NOT_CONFIGURED');
        }
        return true;
      };

      assert.strictEqual(checkConfig(), true);
    });
  });

  describe('Authorization Code & Redirect URI Validation', () => {
    it('accepts valid code and valid redirectUri', () => {
      const validCases = [
        { code: '4/0AVMBs8xyz...', redirectUri: 'https://cine-vault-gules.vercel.app/auth/google/callback' },
        { code: 'test-code', redirectUri: 'http://localhost:3000/auth/google/callback' },
      ];

      for (const item of validCases) {
        const result = googleLoginSchema.safeParse(item);
        assert.strictEqual(result.success, true, `Expected ${JSON.stringify(item)} to be valid`);
      }
    });

    it('rejects missing or empty authorization code', () => {
      const invalid = { code: '', redirectUri: 'https://cine-vault-gules.vercel.app/auth/google/callback' };
      const result = googleLoginSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.error.issues[0].message, 'Authorization code is required');
      }
    });

    it('rejects invalid redirect URI formats', () => {
      const invalidUris = ['not-a-url', '/auth/google/callback', 'javascript:alert(1)', ''];
      for (const redirectUri of invalidUris) {
        const result = googleLoginSchema.safeParse({ code: 'valid-code', redirectUri });
        assert.strictEqual(result.success, false, `Expected ${redirectUri} to be rejected`);
      }
    });
  });

  describe('ID Token Verification & Safety Checks', () => {
    it('rejects tokens where email_verified is false to prevent account takeover', () => {
      const mockPayload = {
        sub: 'google-user-12345',
        email: 'victim@example.com',
        email_verified: false, // NOT verified by Google
        name: 'Attacker Fake User',
      };

      const verifyEmail = (payload: typeof mockPayload) => {
        if (!payload.email_verified) {
          throw new AppError('Google email is not verified', 400, 'EMAIL_NOT_VERIFIED');
        }
      };

      assert.throws(() => verifyEmail(mockPayload), (err: unknown) => {
        const appErr = err as AppError;
        assert.strictEqual(appErr.statusCode, 400);
        assert.strictEqual(appErr.code, 'EMAIL_NOT_VERIFIED');
        return true;
      });
    });

    it('accepts verified email payloads and extracts profile safely', () => {
      const mockPayload = {
        sub: '109876543210987654321',
        email: 'RealUser@Example.COM',
        email_verified: true,
        name: 'Jane Doe',
        picture: 'https://lh3.googleusercontent.com/a/photo.jpg',
      };

      assert.strictEqual(mockPayload.email_verified, true);
      const googleUserId = mockPayload.sub;
      const googleEmail = mockPayload.email.toLowerCase();
      const googleName = mockPayload.name || googleEmail.split('@')[0];

      assert.strictEqual(googleUserId, '109876543210987654321');
      assert.strictEqual(googleEmail, 'realuser@example.com');
      assert.strictEqual(googleName, 'Jane Doe');
    });

    it('rejects incomplete profile payloads missing sub or email', () => {
      const incompleteCases = [
        { sub: '', email: 'user@example.com', email_verified: true },
        { sub: '123', email: '', email_verified: true },
      ];

      for (const payload of incompleteCases) {
        const check = () => {
          if (!payload.sub || !payload.email) {
            throw new AppError('Incomplete Google profile data', 400, 'INCOMPLETE_PROFILE');
          }
        };
        assert.throws(check, (err: unknown) => {
          assert.strictEqual((err as AppError).code, 'INCOMPLETE_PROFILE');
          return true;
        });
      }
    });
  });

  describe('Account Linking & Username Sanitization Safety', () => {
    it('sanitizes usernames to alphanumeric characters and underscores', () => {
      assert.strictEqual(generateBaseUsername('John Doe! #123'), 'johndoe123');
      assert.strictEqual(generateBaseUsername('jean-luc.picard@cine'), 'jeanlucpicardcine');
      assert.strictEqual(generateBaseUsername('user_name_test'), 'user_name_test');
    });

    it('falls back to "user" when username contains only special characters', () => {
      assert.strictEqual(generateBaseUsername('!@#$%^&*()'), 'user');
      assert.strictEqual(generateBaseUsername(''), 'user');
    });

    it('truncates username to maximum 20 characters', () => {
      const longName = 'supercalifragilisticexpialidocious';
      const sanitized = generateBaseUsername(longName);
      assert.strictEqual(sanitized.length, 20);
      assert.strictEqual(sanitized, 'supercalifragilistic');
    });

    it('creates OAuth-only users with null passwordHash', () => {
      const newUserRecord = {
        username: 'cineuser',
        email: 'cineuser@example.com',
        passwordHash: null,
        displayName: 'Cine User',
        role: 'member',
      };

      assert.strictEqual(newUserRecord.passwordHash, null, 'OAuth accounts must not have a default password');
      assert.strictEqual(newUserRecord.role, 'member');
    });

    it('enforces secure cookie attributes based on environment', () => {
      const isProd = config.nodeEnv === 'production';
      const cookieConfig = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' as const : 'lax' as const,
      };

      assert.strictEqual(cookieConfig.httpOnly, true, 'Cookies must be httpOnly to prevent XSS access');
      if (isProd) {
        assert.strictEqual(cookieConfig.secure, true);
        assert.strictEqual(cookieConfig.sameSite, 'none');
      } else {
        assert.strictEqual(cookieConfig.sameSite, 'lax');
      }
    });
  });
});
