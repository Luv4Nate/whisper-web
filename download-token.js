import crypto from 'crypto';

const DEFAULT_TTL_SEC = 900;

export function issueDownloadToken(email, license, secret, ttlSec = DEFAULT_TTL_SEC) {
  if (!secret || !email || !license) return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = Buffer.from(JSON.stringify({ email, license, exp }), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyDownloadToken(token, secret) {
  if (!token || !secret) return null;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return null;
  const payloadPart = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadPart).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof data.email !== 'string' || typeof data.license !== 'string') return null;
    return { email: data.email, license: data.license };
  } catch {
    return null;
  }
}
