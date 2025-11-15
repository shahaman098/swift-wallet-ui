import crypto from 'node:crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_SECRET = 'swift-wallet-dev-secret';

function getSecret() {
  return process.env.SWIFT_WALLET_SECRET || DEFAULT_SECRET;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') {
    return false;
  }

  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) {
    return false;
  }

  const derived = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, 'sha512')
    .toString('hex');

  const originalBuffer = Buffer.from(originalHash, 'hex');
  const derivedBuffer = Buffer.from(derived, 'hex');

  if (originalBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, derivedBuffer);
}

export function generateToken(userId) {
  const issuedAt = Date.now().toString();
  const payload = `${userId}:${issuedAt}`;
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');

  const token = Buffer.from(`${payload}:${signature}`, 'utf8').toString('base64url');
  return token;
}

export function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [userId, issuedAt, signature] = decoded.split(':');

    if (!userId || !issuedAt || !signature) {
      throw new Error('Malformed token');
    }

    const age = Date.now() - Number(issuedAt);
    if (!Number.isFinite(age) || age < 0 || age > TOKEN_TTL_MS) {
      throw new Error('Token expired');
    }

    const payload = `${userId}:${issuedAt}`;
    const expectedSignature = crypto
      .createHmac('sha256', getSecret())
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(signature, 'hex');

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      throw new Error('Invalid signature');
    }

    return { userId };
  } catch (error) {
    const invalid = new Error('Invalid token');
    invalid.cause = error;
    throw invalid;
  }
}
