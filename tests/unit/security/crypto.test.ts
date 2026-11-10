import { describe, it, expect } from "vitest";
import {
  generateShareToken,
  hashSharePasskey,
  verifySharePasskey,
  isShareLinkExpired,
} from "@/lib/security/crypto";

describe("Cryptographic Security & Passkey Verification", () => {
  describe("generateShareToken", () => {
    it("should generate a URL-safe token with sufficient entropy", () => {
      const token = generateShareToken();
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThanOrEqual(21);
      // Ensure only URL-safe base64url characters (A-Z, a-z, 0-9, -, _)
      expect(/^[A-Za-z0-9\-_]+$/.test(token)).toBe(true);
    });

    it("should produce unique tokens across multiple invocations", () => {
      const tokenSet = new Set<string>();
      for (let i = 0; i < 500; i++) {
        const token = generateShareToken();
        expect(tokenSet.has(token)).toBe(false);
        tokenSet.add(token);
      }
      expect(tokenSet.size).toBe(500);
    });
  });

  describe("hashSharePasskey & verifySharePasskey", () => {
    it("should hash and verify a valid passkey accurately", () => {
      const passkey = "ShuvoNoboborsho2026!";
      const hash = hashSharePasskey(passkey);

      expect(hash.startsWith("scrypt$16384$8$1$")).toBe(true);

      const isValid = verifySharePasskey(passkey, hash);
      expect(isValid).toBe(true);

      const isInvalid = verifySharePasskey("WrongPassword123", hash);
      expect(isInvalid).toBe(false);
    });

    it("should generate distinct hashes for identical passkeys due to random salt", () => {
      const passkey = "EidMubarak1433";
      const hash1 = hashSharePasskey(passkey);
      const hash2 = hashSharePasskey(passkey);

      expect(hash1).not.toBe(hash2);
      expect(verifySharePasskey(passkey, hash1)).toBe(true);
      expect(verifySharePasskey(passkey, hash2)).toBe(true);
    });

    it("should reject passkeys shorter than 4 characters", () => {
      expect(() => hashSharePasskey("123")).toThrow(/Passkey must be at least 4 characters/);
      expect(() => hashSharePasskey("")).toThrow(/Passkey must be at least 4 characters/);
    });

    it("should return false for malformed or tampered hash strings", () => {
      expect(verifySharePasskey("pass123", "not-a-valid-hash")).toBe(false);
      expect(verifySharePasskey("pass123", "scrypt$invalid$format")).toBe(false);
      expect(verifySharePasskey("pass123", "")).toBe(false);
    });
  });

  describe("isShareLinkExpired", () => {
    it("should return false when expiresAt is null or undefined (permanent link)", () => {
      expect(isShareLinkExpired(null)).toBe(false);
      expect(isShareLinkExpired(undefined)).toBe(false);
    });

    it("should return false for future expiration timestamps", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours in future
      expect(isShareLinkExpired(futureDate)).toBe(false);
      expect(isShareLinkExpired(futureDate.toISOString())).toBe(false);
    });

    it("should return true for past expiration timestamps", () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour in past
      expect(isShareLinkExpired(pastDate)).toBe(true);
      expect(isShareLinkExpired(pastDate.toISOString())).toBe(true);
    });
  });
});
