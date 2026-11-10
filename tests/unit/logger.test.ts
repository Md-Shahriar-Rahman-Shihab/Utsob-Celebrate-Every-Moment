import { describe, it, expect } from "vitest";
import { scrubPII } from "@/lib/logger";

describe("Logger & PII Scrubbing", () => {
  it("should scrub Bearer authentication tokens", () => {
    const input = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret";
    const scrubbed = scrubPII(input);
    expect(scrubbed).toBe("Authorization: Bearer [REDACTED]");
  });

  it("should scrub Bangladeshi mobile phone numbers", () => {
    const textWithPhone1 = "User phone is +8801712345678 in Dhaka";
    const textWithPhone2 = "Emergency contact: 01898765432";

    const scrubbed1 = scrubPII(textWithPhone1) as string;
    const scrubbed2 = scrubPII(textWithPhone2) as string;

    expect(scrubbed1).toContain("+88017XX-XXXX5678");
    expect(scrubbed1).not.toContain("01712345678");

    expect(scrubbed2).toContain("018XX-XXXX5432");
    expect(scrubbed2).not.toContain("01898765432");
  });

  it("should scrub email addresses", () => {
    const input = "Contact email is tanvir@gmail.com for RSVP";
    const scrubbed = scrubPII(input) as string;
    expect(scrubbed).toContain("t***@gmail.com");
    expect(scrubbed).not.toContain("tanvir@gmail.com");
  });

  it("should scrub sensitive keys in nested objects", () => {
    const payload = {
      userId: "user-123",
      email: "guest@example.com",
      password: "SuperSecretPassword123!",
      auth_secret: "hidden-key",
      meta: {
        token: "session-abc-xyz",
        phoneNumber: "+8801912345678",
      },
    };

    const scrubbed = scrubPII(payload) as Record<string, unknown>;
    expect(scrubbed.userId).toBe("user-123");
    expect(scrubbed.password).toBe("[REDACTED]");
    expect(scrubbed.auth_secret).toBe("[REDACTED]");

    const nestedMeta = scrubbed.meta as Record<string, unknown>;
    expect(nestedMeta.token).toBe("[REDACTED]");
    expect(nestedMeta.phoneNumber).toContain("+88019XX-XXXX5678");
  });
});
