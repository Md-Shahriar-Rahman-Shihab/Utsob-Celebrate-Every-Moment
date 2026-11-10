import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  toApiErrorResponse,
} from "@/lib/errors";
import { z } from "zod";

describe("Application Errors & Standard Envelopes", () => {
  it("should create AppError with status code, error code, and details", () => {
    const error = new AppError("Custom error", 418, "TEAPOT", { detail: "I am a teapot" });
    expect(error.message).toBe("Custom error");
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe("TEAPOT");
    expect(error.details).toEqual({ detail: "I am a teapot" });
  });

  it("should correctly instantiate specific domain errors with default HTTP status codes", () => {
    const notFound = new NotFoundError("Card not found");
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe("NOT_FOUND");

    const validation = new ValidationError("Invalid inputs");
    expect(validation.statusCode).toBe(422);
    expect(validation.code).toBe("VALIDATION_ERROR");

    const unauthorized = new UnauthorizedError();
    expect(unauthorized.statusCode).toBe(401);
    expect(unauthorized.code).toBe("UNAUTHORIZED");

    const forbidden = new ForbiddenError();
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.code).toBe("FORBIDDEN");

    const conflict = new ConflictError();
    expect(conflict.statusCode).toBe(409);
    expect(conflict.code).toBe("CONFLICT");

    const rateLimit = new RateLimitError();
    expect(rateLimit.statusCode).toBe(429);
    expect(rateLimit.code).toBe("RATE_LIMITED");
  });

  describe("toApiErrorResponse", () => {
    it("should format AppError into standardized error envelope", () => {
      const error = new NotFoundError("Template does not exist", { id: "123" });
      const { status, body } = toApiErrorResponse(error);

      expect(status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_FOUND");
      expect(body.error.message).toBe("Template does not exist");
      expect(body.error.details).toEqual({ id: "123" });
      expect(body.error.timestamp).toBeTruthy();
    });

    it("should format ZodError into 422 VALIDATION_ERROR envelope with field issues", () => {
      const schema = z.object({
        title: z.string().min(5),
      });

      const parseResult = schema.safeParse({ title: "hi" });
      expect(parseResult.success).toBe(false);

      if (!parseResult.success) {
        const { status, body } = toApiErrorResponse(parseResult.error);
        expect(status).toBe(422);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("VALIDATION_ERROR");
        expect(Array.isArray(body.error.details)).toBe(true);
      }
    });

    it("should format standard generic Error into 500 INTERNAL_SERVER_ERROR envelope", () => {
      const genericError = new Error("Database connection lost");
      const { status, body } = toApiErrorResponse(genericError);

      expect(status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });
});

