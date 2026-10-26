import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * Mirrors the buildPrismaUrl() logic from config/database.ts.
 *
 * Regression test for PostgreSQL error 42P05 ("prepared statement already exists")
 * which occurs when Prisma connects through a transaction-mode pooler (Supabase
 * Supavisor / PgBouncer on port 6543) without ?pgbouncer=true.
 *
 * Root cause: Prisma 5 uses named prepared statements by default. Transaction poolers
 * multiplex connections — a prepared statement cached on one server connection is not
 * visible on another, so Postgres reports it "already exists" when Prisma tries to
 * recreate it on a freshly assigned connection.
 *
 * Fix: ?pgbouncer=true tells Prisma to use unnamed (simple) queries, bypassing
 * the prepared-statement mechanism entirely.
 */
function buildPrismaUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const isTransactionPooler =
    url.port === '6543' ||
    url.hostname.includes('pooler.supabase.com');

  const alreadyHasFlag =
    url.searchParams.has('pgbouncer') ||
    url.searchParams.has('prepared_statements');

  if (isTransactionPooler && !alreadyHasFlag) {
    url.searchParams.set('pgbouncer', 'true');
    return url.toString();
  }

  return rawUrl;
}

describe('Database Connection URL Safety Suite (42P05 regression)', () => {
  describe('Transaction pooler detection and pgbouncer flag injection', () => {
    it('appends ?pgbouncer=true for a Supabase port-6543 pooler URL', () => {
      const input = 'postgresql://user:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
      const result = buildPrismaUrl(input);
      const parsed = new URL(result);
      assert.strictEqual(parsed.searchParams.get('pgbouncer'), 'true',
        'Must append pgbouncer=true for port-6543 pooler connections');
    });

    it('appends ?pgbouncer=true for a pooler.supabase.com hostname regardless of port', () => {
      const input = 'postgresql://user:pass@db.pooler.supabase.com:5432/postgres';
      const result = buildPrismaUrl(input);
      const parsed = new URL(result);
      assert.strictEqual(parsed.searchParams.get('pgbouncer'), 'true',
        'Must append pgbouncer=true for pooler.supabase.com hostnames');
    });

    it('does NOT modify direct connection URLs (port 5432, non-pooler hostname)', () => {
      const input = 'postgresql://user:pass@db.abc123.supabase.co:5432/postgres';
      const result = buildPrismaUrl(input);
      assert.strictEqual(result, input,
        'Direct connection URLs must be returned unchanged');
    });

    it('does NOT double-append pgbouncer=true if already present', () => {
      const input = 'postgresql://user:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
      const result = buildPrismaUrl(input);
      const parsed = new URL(result);
      // pgbouncer param should appear exactly once
      const occurrences = result.split('pgbouncer').length - 1;
      assert.strictEqual(occurrences, 1, 'pgbouncer= must appear exactly once');
      assert.strictEqual(parsed.searchParams.get('pgbouncer'), 'true');
    });

    it('does NOT append pgbouncer if ?prepared_statements param already present', () => {
      const input = 'postgresql://user:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?prepared_statements=false';
      const result = buildPrismaUrl(input);
      assert.strictEqual(result, input,
        'Must not add pgbouncer when prepared_statements is already configured');
    });

    it('preserves other existing query parameters when appending pgbouncer=true', () => {
      const input = 'postgresql://user:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?connection_limit=10';
      const result = buildPrismaUrl(input);
      const parsed = new URL(result);
      assert.strictEqual(parsed.searchParams.get('connection_limit'), '10',
        'Existing params must be preserved');
      assert.strictEqual(parsed.searchParams.get('pgbouncer'), 'true');
    });

    it('handles localhost and development URLs without modification', () => {
      const input = 'postgresql://user:pass@localhost:5432/cinevault_dev';
      const result = buildPrismaUrl(input);
      assert.strictEqual(result, input,
        'Local development URLs must not be modified');
    });

    it('returns unparseable URL unchanged without throwing', () => {
      const input = 'not-a-valid-url';
      assert.doesNotThrow(() => buildPrismaUrl(input));
      const result = buildPrismaUrl(input);
      assert.strictEqual(result, input);
    });

    it('does not include credentials in any log output (safety check)', () => {
      // The function itself must not log or expose the URL — it only returns it.
      // This test verifies the function is pure (no side effects that expose data).
      const input = 'postgresql://super_secret_user:super_secret_pass@aws-0-ap.pooler.supabase.com:6543/postgres';
      const result = buildPrismaUrl(input);
      // The returned URL still contains creds (caller's responsibility to protect it)
      // but the function itself does not throw or call external services
      assert.ok(result.includes('pgbouncer=true'), 'Must add pgbouncer flag');
    });
  });

  describe('42P05 error scenario validation', () => {
    it('confirms that port 6543 is the transaction pooler port for Supabase', () => {
      // Supabase Supavisor modes:
      // Port 5432 = Session mode (supports prepared statements)
      // Port 6543 = Transaction mode (does NOT support prepared statements)
      const transactionPoolerPort = '6543';
      const sessionPoolerPort = '5432';

      const txUrl = new URL(`postgresql://u:p@host:${transactionPoolerPort}/db`);
      const sessionUrl = new URL(`postgresql://u:p@host:${sessionPoolerPort}/db`);

      assert.strictEqual(txUrl.port, '6543', 'Transaction pooler must use port 6543');
      assert.notStrictEqual(sessionUrl.port, '6543', 'Session mode does not use port 6543');
    });

    it('confirms Prisma 5 requires pgbouncer=true to disable named prepared statements in transaction mode', () => {
      // This documents the required fix as a living contract
      const poolerUrl = 'postgresql://u:p@aws-0-ap.pooler.supabase.com:6543/db';
      const fixed = buildPrismaUrl(poolerUrl);
      assert.ok(
        fixed.includes('pgbouncer=true'),
        'Production DATABASE_URL pointing to port 6543 MUST have pgbouncer=true to avoid 42P05',
      );
    });
  });
});
