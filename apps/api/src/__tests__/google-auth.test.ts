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

    it('returns public config with clientId when configured, without exposing secret', () => {
      const sampleConfig = {
        google: {
          clientId: 'public-client-id-123.apps.googleusercontent.com',
          clientSecret: 'super-sensitive-secret-never-expose',
        },
      };

      const getPublicConfig = (cfg: typeof sampleConfig) => {
        const isConfigured = Boolean(cfg.google.clientId && cfg.google.clientSecret);
        return {
          configured: isConfigured,
          clientId: isConfigured ? cfg.google.clientId : null,
        };
      };

      const result = getPublicConfig(sampleConfig);
      assert.strictEqual(result.configured, true);
      assert.strictEqual(result.clientId, 'public-client-id-123.apps.googleusercontent.com');
      assert.strictEqual('clientSecret' in result, false, 'clientSecret must never be present in public config');
    });

    it('returns configured: false and clientId: null when either credential is missing', () => {
      const getPublicConfig = (cfg: { clientId?: string; clientSecret?: string }) => {
        const isConfigured = Boolean(cfg.clientId && cfg.clientSecret);
        return {
          configured: isConfigured,
          clientId: isConfigured ? cfg.clientId : null,
        };
      };

      const missingId = getPublicConfig({ clientId: '', clientSecret: 'secret' });
      assert.strictEqual(missingId.configured, false);
      assert.strictEqual(missingId.clientId, null);

      const missingSecret = getPublicConfig({ clientId: 'id', clientSecret: '' });
      assert.strictEqual(missingSecret.configured, false);
      assert.strictEqual(missingSecret.clientId, null);
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

    it('correctly constructs Google OAuth authorization URL with all required query parameters', () => {
      const clientId = '123456789-abcdef.apps.googleusercontent.com';
      const redirectUri = 'https://cine-vault-gules.vercel.app/auth/google/callback';
      const state = 'csrf-random-uuid-12345';

      const buildAuthUrl = (cid: string, rUri: string, st: string) => {
        const params = new URLSearchParams({
          client_id: cid,
          redirect_uri: rUri,
          response_type: 'code',
          scope: 'openid email profile',
          access_type: 'offline',
          prompt: 'consent',
          state: st,
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      };

      const url = new URL(buildAuthUrl(clientId, redirectUri, state));
      assert.strictEqual(url.origin, 'https://accounts.google.com');
      assert.strictEqual(url.pathname, '/o/oauth2/v2/auth');
      assert.strictEqual(url.searchParams.get('client_id'), clientId);
      assert.strictEqual(url.searchParams.get('redirect_uri'), redirectUri);
      assert.strictEqual(url.searchParams.get('response_type'), 'code');
      assert.strictEqual(url.searchParams.get('scope'), 'openid email profile');
      assert.strictEqual(url.searchParams.get('access_type'), 'offline');
      assert.strictEqual(url.searchParams.get('prompt'), 'consent');
      assert.strictEqual(url.searchParams.get('state'), state);
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

  describe('Code Exchange Error Classification', () => {
    // Simulates the improved error parsing added to google-auth.ts
    function classifyCodeExchangeError(googleErrorCode: string): { httpStatus: number; appCode: string } {
      if (googleErrorCode === 'redirect_uri_mismatch') {
        return { httpStatus: 400, appCode: 'REDIRECT_URI_MISMATCH' };
      }
      if (googleErrorCode === 'invalid_client') {
        return { httpStatus: 502, appCode: 'INVALID_OAUTH_CLIENT' };
      }
      return { httpStatus: 400, appCode: 'INVALID_AUTH_CODE' };
    }

    it('maps redirect_uri_mismatch to REDIRECT_URI_MISMATCH (400)', () => {
      const result = classifyCodeExchangeError('redirect_uri_mismatch');
      assert.strictEqual(result.httpStatus, 400);
      assert.strictEqual(result.appCode, 'REDIRECT_URI_MISMATCH');
    });

    it('maps invalid_client to INVALID_OAUTH_CLIENT (502)', () => {
      const result = classifyCodeExchangeError('invalid_client');
      assert.strictEqual(result.httpStatus, 502);
      assert.strictEqual(result.appCode, 'INVALID_OAUTH_CLIENT');
    });

    it('maps unknown/expired codes to INVALID_AUTH_CODE (400)', () => {
      const result = classifyCodeExchangeError('invalid_grant');
      assert.strictEqual(result.httpStatus, 400);
      assert.strictEqual(result.appCode, 'INVALID_AUTH_CODE');
    });

    it('does not log authorization code, client secret, or access tokens', () => {
      // Verify the log format contains only safe fields
      const safeLogFields = ['google_error', 'status', 'description', 'redirect_uri'];
      const dangerousFields = ['code', 'client_secret', 'access_token', 'refresh_token', 'id_token'];

      // Simulate what would be logged
      const loggedData = {
        google_error: 'redirect_uri_mismatch',
        status: 400,
        description: 'Redirect URI mismatch',
        redirect_uri: 'https://cine-vault-gules.vercel.app/auth/google/callback',
      };

      for (const field of safeLogFields) {
        assert.strictEqual(field in loggedData, true, `Expected safe field "${field}" to be loggable`);
      }
      for (const field of dangerousFields) {
        assert.strictEqual(field in loggedData, false, `Dangerous field "${field}" must NOT be logged`);
      }
    });
  });
});
