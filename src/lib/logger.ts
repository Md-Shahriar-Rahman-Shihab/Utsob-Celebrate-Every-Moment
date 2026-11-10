export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Scrubs sensitive patterns (passwords, tokens, Bangladeshi phone numbers, emails)
 * from objects and strings to prevent PII leakage into log streams.
 */
export function scrubPII(input: unknown): unknown {
  if (typeof input === "string") {
    return input
      // Redact Bearer tokens
      .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, "Bearer [REDACTED]")
      // Redact sensitive key-value pairs
      .replace(/(password|secret|apiKey|api_key|token|auth_secret)\s*[:=]\s*["']?[^"',\s}]+/gi, "$1=[REDACTED]")
      // Redact Bangladeshi mobile phone numbers (e.g. +8801712345678 or 01712345678)
      .replace(/(\+?880|0)(1[3-9])\d{4}(\d{4})/g, (_match, prefix, operatorCode, last4) => {
        return `${prefix}${operatorCode}XX-XXXX${last4}`;
      })
      // Redact email addresses (e.g. user@domain.com -> u***@domain.com)
      .replace(/([a-zA-Z0-9_\-.])[a-zA-Z0-9_\-.]*@([a-zA-Z0-9\-.]+\.[a-zA-Z]{2,})/g, "$1***@$2");
  }

  if (Array.isArray(input)) {
    return input.map(scrubPII);
  }

  if (input !== null && typeof input === "object") {
    const scrubbedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("token") ||
        lowerKey.includes("authorization")
      ) {
        scrubbedObj[key] = "[REDACTED]";
      } else {
        scrubbedObj[key] = scrubPII(value);
      }
    }
    return scrubbedObj;
  }

  return input;
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = scrubPII(context) as Record<string, unknown>;
    }

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      };
    }

    return entry;
  }

  public info(message: string, context?: Record<string, unknown>): void {
    const entry = this.formatLog("info", message, context);
    console.log(JSON.stringify(entry));
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.formatLog("warn", message, context);
    console.warn(JSON.stringify(entry));
  }

  public error(message: string, context?: Record<string, unknown>, error?: unknown): void {
    const entry = this.formatLog("error", message, context, error);
    console.error(JSON.stringify(entry));
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      const entry = this.formatLog("debug", message, context);
      console.debug(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();
