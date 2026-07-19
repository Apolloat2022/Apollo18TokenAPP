// api/_lib/db.ts
// Server-only Neon Postgres client. NEVER import from app/ (client) code — the
// connection string must never reach the browser.
//
// The @neondatabase/serverless driver is stateless HTTP: no connection is
// opened at construction, only per query. So constructing with a placeholder
// when NEON_DATABASE_URL is unset does not connect to anything — queries simply
// fail at request time (which the handlers turn into a 500), instead of
// crashing the function at cold start with an opaque parse error.
import { neon } from '@neondatabase/serverless';

const url = process.env.NEON_DATABASE_URL;

if (!url) {
  console.error('Missing NEON_DATABASE_URL env var — database calls will fail.');
}

export const sql = neon(url || 'postgresql://placeholder:placeholder@localhost/placeholder');
