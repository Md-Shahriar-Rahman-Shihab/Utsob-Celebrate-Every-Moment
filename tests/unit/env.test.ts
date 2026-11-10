import { describe, it, expect } from "vitest";
import { validateEnv } from "@/lib/env";

describe("Environment Validation", () => {
  const validMockEnv = {
    NODE_ENV: "test",
    PORT: "3000",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    DATABASE_URL: "postgresql://postgres:secret@localhost:5432/utsob?sslmode=disable",
    DIRECT_URL: "postgresql://postgres:secret@localhost:5432/utsob?sslmode=disable",
    AUTH_SECRET: "this-is-a-very-secure-secret-key-for-testing",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "test-cloud",
    CLOUDINARY_API_KEY: "test-key",
    CLOUDINARY_API_SECRET: "test-secret",
    GEMINI_API_KEY: "test-gemini-key",
  };

  it("should successfully parse and coerce a valid environment dictionary", () => {
    const parsed = validateEnv(validMockEnv);
    expect(parsed.NODE_ENV).toBe("test");
    expect(parsed.PORT).toBe(3000); // Coerced to number
    expect(parsed.DATABASE_URL).toBe(validMockEnv.DATABASE_URL);
    expect(parsed.AUTH_SECRET).toBe(validMockEnv.AUTH_SECRET);
  });

  it("should fail validation when DATABASE_URL is missing", () => {
    const invalidEnv = { ...validMockEnv, DATABASE_URL: "" };
    expect(() => validateEnv(invalidEnv)).toThrow(/DATABASE_URL is required/);
  });

  it("should fail validation when AUTH_SECRET is shorter than 16 characters", () => {
    const invalidEnv = { ...validMockEnv, AUTH_SECRET: "too-short" };
    expect(() => validateEnv(invalidEnv)).toThrow(/AUTH_SECRET must be at least 16 characters/);
  });

  it("should apply sensible defaults when optional fields are omitted", () => {
    const minimalEnv = {
      DATABASE_URL: "postgresql://postgres:secret@localhost:5432/utsob",
      AUTH_SECRET: "super-secure-auth-secret-12345678",
    };
    const parsed = validateEnv(minimalEnv);
    expect(parsed.NODE_ENV).toBe("development");
    expect(parsed.PORT).toBe(3000);
    expect(parsed.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });
});

