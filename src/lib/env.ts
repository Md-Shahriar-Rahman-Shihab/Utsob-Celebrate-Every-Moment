import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Database (PostgreSQL / Neon)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),

  // Auth.js / NextAuth v5
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Google Gemini API
  GEMINI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates a custom or standard environment variable dictionary.
 * Useful for unit testing and startup diagnostics.
 */
export function validateEnv(environment: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(environment);
  if (!result.success) {
    const issues = result.error.issues || (result.error as { errors?: Array<{ path: Array<string | number>; message: string }> }).errors || [];
    const errorMessages = issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `\n❌ Invalid environment variables detected:\n${errorMessages}\n\nPlease check your .env.local file against .env.example.\n`
    );
  }
  return result.data;
}

// Lazy evaluation of runtime environment to prevent build-time crashes when DB is not yet connected
let parsedEnv: Env | undefined;

export function getEnv(): Env {
  if (!parsedEnv) {
    parsedEnv = validateEnv(process.env);
  }
  return parsedEnv;
}

export { envSchema };
