import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// ==============================================================================
// UTSOB (উৎসব) — Cryptographic Security Utilities
// ==============================================================================
// 1. High-entropy URL-safe share token generator (128-bit cryptographic random)
// 2. Salted scrypt key derivation for ShareLink passkeys
// 3. Constant-time comparison preventing timing side-channel attacks
// ==============================================================================

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;

/**
 * Generates a cryptographically secure, URL-safe random share token.
 * Yields 128 bits of entropy (22 base64url characters), making brute-force unfeasible.
 */
export function generateShareToken(): string {
  return randomBytes(16).toString("base64url");
}

/**
 * Hashes a passkey for private share links using scrypt with a random 16-byte salt.
 * Format: `scrypt$N$r$p$saltHex$derivedKeyHex`
 */
export function hashSharePasskey(passkey: string): string {
  if (!passkey || passkey.length < 4) {
    throw new Error("Passkey must be at least 4 characters");
  }

  const salt = randomBytes(SALT_BYTES);
  const derivedKey = scryptSync(passkey, salt, SCRYPT_KEYLEN, {
    N: 16384, // CPU/memory cost
    r: 8,     // Block size
    p: 1,     // Parallelization
  });

  return `scrypt$16384$8$1$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

/**
 * Verifies a provided passkey against a stored scrypt hash using constant-time comparison.
 * Eliminates timing side-channel vulnerabilities.
 */
export function verifySharePasskey(passkey: string, storedHash: string): boolean {
  if (!passkey || !storedHash) {
    return false;
  }

  try {
    const parts = storedHash.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") {
      return false;
    }

    const N = parseInt(parts[1], 10);
    const r = parseInt(parts[2], 10);
    const p = parseInt(parts[3], 10);
    const salt = Buffer.from(parts[4], "hex");
    const originalKey = Buffer.from(parts[5], "hex");

    if (salt.length !== SALT_BYTES || originalKey.length !== SCRYPT_KEYLEN) {
      return false;
    }

    const testKey = scryptSync(passkey, salt, SCRYPT_KEYLEN, { N, r, p });

    return timingSafeEqual(originalKey, testKey);
  } catch {
    return false;
  }
}

/**
 * Checks whether a share link's expiration date has passed.
 */
export function isShareLinkExpired(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() <= Date.now();
}

