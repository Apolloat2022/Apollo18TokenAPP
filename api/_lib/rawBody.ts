// api/_lib/rawBody.ts
// Reads the unparsed request body. Webhook signatures (Stripe, Coinbase) are
// computed over the exact bytes sent, so we must verify against the raw body,
// not a re-serialized parse. Pair with `export const config = { api: { bodyParser: false } }`
// in the handler so Vercel doesn't consume the stream first.
import type { VercelRequest } from '@vercel/node';

export async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
