import crypto from 'crypto';

/**
 * Timing-safe comparison to prevent timing attacks on tokens.
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // We still do a comparison to keep timing relatively consistent,
    // though length check already leaks something.
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
