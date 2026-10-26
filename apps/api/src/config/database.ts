import { PrismaClient } from '@prisma/client';
import { config } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Returns a database URL that is safe for use with Prisma's query engine.
 *
 * Supabase's transaction pooler (PgBouncer/Supavisor, port 6543) operates in
 * "transaction mode" which does NOT support PostgreSQL named prepared statements.
 * Prisma 5 uses named prepared statements by default, causing error 42P05
 * ("prepared statement already exists") on any query after the first request.
 *
 * The fix: append `?pgbouncer=true` to the DATABASE_URL when connecting through
 * a transaction pooler. Prisma treats this flag as a signal to disable named
 * prepared statements and use simple (unnamed) queries instead.
 *
 * References:
 * - https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases/supabase
 * - https://supabase.com/docs/guides/database/connecting-to-postgres#how-connection-pooling-works
 */
function buildPrismaUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    // If the URL is unparseable, return as-is and let Prisma report the error.
    return rawUrl;
  }

  const isTransactionPooler =
    // Supabase Supavisor / PgBouncer transaction mode runs on port 6543
    url.port === '6543' ||
    // Explicit pooler hostname pattern used by Supabase
    url.hostname.includes('pooler.supabase.com');

  const alreadyHasFlag =
    url.searchParams.has('pgbouncer') ||
    url.searchParams.has('prepared_statements');

  if (isTransactionPooler && !alreadyHasFlag) {
    url.searchParams.set('pgbouncer', 'true');
    console.log(
      '[DB] Transaction pooler detected — pgbouncer=true applied to disable named prepared statements (42P05 fix)',
    );
    return url.toString();
  }

  if (!isTransactionPooler && !alreadyHasFlag) {
    // Direct connection or unknown pooler — no modification needed
    console.log('[DB] Direct connection mode — prepared statements active');
  }

  return rawUrl;
}

const dbUrl = buildPrismaUrl(config.databaseUrl);

export const prisma =
  global.__prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
