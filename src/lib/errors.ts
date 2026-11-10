import { ApiErrorResponse } from "@/types/api";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied: insufficient permissions", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict: duplicate entry", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded. Please try again later.", details?: unknown) {
    super(message, 429, "RATE_LIMITED", details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred", details?: unknown) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
  }
}

/**
 * Formats any caught error into a standardized ApiErrorResponse envelope.
 */
export function toApiErrorResponse(error: unknown): { status: number; body: ApiErrorResponse } {
  const timestamp = new Date().toISOString();

  if (error instanceof ZodError) {
    const issues = error.issues || (error as { errors?: Array<{ path: Array<string | number>; message: string; code?: string }> }).errors || [];
    const formattedDetails = issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: (issue as { code?: string }).code,
    }));
    return {
      status: 422,
      body: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Input validation failed",
          details: formattedDetails,
          timestamp,
        },
      },
    };
  }

  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp,
        },
      },
    };
  }

  const message = error instanceof Error ? error.message : "Unknown error occurred";
  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
        timestamp,
      },
    },
  };
}
