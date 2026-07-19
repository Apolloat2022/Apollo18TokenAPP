// api/_lib/auth.ts
// Verifies a Clerk session token server-side and returns the Clerk user id.
// Used by every authenticated /api/* route so the user id comes from a
// cryptographically verified token, never from client-supplied input.
import { verifyToken } from '@clerk/backend';

const SECRET_KEY = process.env.CLERK_SECRET_KEY ?? '';

// Returns the Clerk user id (JWT `sub`) if the Authorization header carries a
// valid Clerk session token, else null.
export async function getClerkUserId(authHeader?: string): Promise<string | null> {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || !SECRET_KEY) return null;

  try {
    const payload = await verifyToken(token, { secretKey: SECRET_KEY });
    return payload.sub ?? null;
  } catch (err) {
    console.error('Clerk token verification failed:', err);
    return null;
  }
}
