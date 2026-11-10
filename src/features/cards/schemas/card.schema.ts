import { z } from "zod";

// ==============================================================================
// UTSOB (উৎসব) — Hardened Canvas Document & Card Schemas
// ==============================================================================
// Security Guardrails:
// 1. Strict object type whitelist (Fabric.js supported types)
// 2. Strict HTTPS URL protocol enforcement & SSRF private IP rejection
// 3. SVG Path syntax verification & script injection prevention
// 4. Color attribute sanitization (blocking url(), expression(), angle brackets)
// 5. Maximum object counts and nesting depth restrictions (preventing DoS)
// 6. Strict object property schemas (blocking prototype pollution)
// ==============================================================================

// Maximum limits
export const MAX_CANVAS_OBJECTS = 200;
export const MAX_GROUP_CHILDREN = 50;
export const MAX_TEXT_LENGTH = 2000;
export const MAX_URL_LENGTH = 2048;
export const MAX_CANVAS_DIMENSION = 4000;
export const MIN_CANVAS_DIMENSION = 100;

// Whitelist of valid Fabric.js object types allowed in Utsob canvases
export const canvasObjectTypeSchema = z.enum([
  "i-text",
  "text",
  "textbox",
  "image",
  "rect",
  "circle",
  "path",
  "line",
  "group",
]);

// Safe color schema: matches hex, rgb, rgba, hsl, hsla, or standard names; blocks url(), expression(), <
export const safeColorSchema = z
  .string()
  .max(64, "Color string too long")
  .refine(
    (val) => {
      const lower = val.toLowerCase().trim();
      if (
        lower.includes("url(") ||
        lower.includes("expression(") ||
        lower.includes("javascript:") ||
        lower.includes("<") ||
        lower.includes(">")
      ) {
        return false;
      }
      return true;
    },
    { message: "Color string contains unsafe or executable CSS expressions" }
  );

// Safe HTTPS Image URL validator preventing SSRF (internal networks) and unsafe schemes
export const safeImageUrlSchema = z
  .string()
  .max(MAX_URL_LENGTH, "Image URL exceeds maximum length")
  .url("Invalid image URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        // Only allow HTTPS protocol (no data:, file:, javascript:, blob:, http:)
        if (parsed.protocol !== "https:") {
          return false;
        }

        const hostname = parsed.hostname.toLowerCase();

        // Reject localhost and loopback addresses
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname === "0.0.0.0" ||
          hostname === "::1"
        ) {
          return false;
        }

        // Reject Cloud metadata services (e.g., AWS/GCP 169.254.169.254)
        if (hostname.startsWith("169.254.")) {
          return false;
        }

        // Reject private IPv4 ranges (RFC 1918)
        if (
          hostname.startsWith("10.") ||
          hostname.startsWith("192.168.") ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
        ) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    {
      message:
        "Image URL must use secure HTTPS protocol and cannot target private or internal network endpoints",
    }
  );

// SVG Path data validator (only valid SVG path command syntax)
export const safeSvgPathSchema = z
  .string()
  .max(10000, "SVG path data too long")
  .refine(
    (path) => {
      // Must only contain standard SVG path commands and coordinates (M, L, H, V, C, S, Q, T, A, Z and numbers)
      return /^[MmLlHhVvCcSsQqTtAaZz0-9\s,.\-+]+$/.test(path);
    },
    { message: "SVG path data contains invalid characters or executable markup" }
  );

// Base canvas object attributes
export const canvasObjectBaseSchema = z
  .object({
    id: z.string().max(64).optional(),
    left: z.number().default(0),
    top: z.number().default(0),
    width: z.number().nonnegative().optional(),
    height: z.number().nonnegative().optional(),
    scaleX: z.number().default(1),
    scaleY: z.number().default(1),
    angle: z.number().default(0),
    opacity: z.number().min(0).max(1).default(1),
    originX: z.enum(["left", "center", "right"]).default("left"),
    originY: z.enum(["top", "center", "bottom"]).default("top"),
    selectable: z.boolean().default(true),
    locked: z.boolean().default(false),
    name: z.string().max(100).optional(),
  })
  .strict();

// Text object attributes (Bengali typography)
export const canvasTextObjectSchema = canvasObjectBaseSchema
  .extend({
    type: z.enum(["i-text", "text", "textbox"]),
    text: z.string().max(MAX_TEXT_LENGTH, "Text length exceeds limit"),
    fontSize: z.number().min(8).max(256).default(32),
    fontFamily: z.string().max(64).default("Hind Siliguri"),
    fontWeight: z.union([z.string().max(16), z.number().min(100).max(900)]).optional(),
    fontStyle: z.enum(["normal", "italic"]).default("normal"),
    fill: safeColorSchema.default("#000000"),
    textAlign: z.enum(["left", "center", "right", "justify"]).default("center"),
    lineHeight: z.number().min(0.5).max(3).default(1.2),
    charSpacing: z.number().min(-100).max(1000).default(0),
  })
  .strict();

// Image object attributes with strict URL validation
export const canvasImageObjectSchema = canvasObjectBaseSchema
  .extend({
    type: z.literal("image"),
    src: safeImageUrlSchema,
    crossOrigin: z.enum(["anonymous", "use-credentials"]).optional(),
  })
  .strict();

// Shape object attributes
export const canvasShapeObjectSchema = canvasObjectBaseSchema
  .extend({
    type: z.enum(["rect", "circle", "line"]),
    fill: safeColorSchema.optional(),
    stroke: safeColorSchema.optional(),
    strokeWidth: z.number().min(0).max(100).optional(),
  })
  .strict();

// SVG Path object attributes
export const canvasPathObjectSchema = canvasObjectBaseSchema
  .extend({
    type: z.literal("path"),
    path: safeSvgPathSchema,
    fill: safeColorSchema.optional(),
    stroke: safeColorSchema.optional(),
    strokeWidth: z.number().min(0).max(100).optional(),
  })
  .strict();

// Leaf objects allowed inside a group (strictly disallowing nested groups to prevent recursion DoS)
export const canvasGroupChildSchema = z.union([
  canvasTextObjectSchema,
  canvasImageObjectSchema,
  canvasShapeObjectSchema,
  canvasPathObjectSchema,
]);

// Group object attributes (capped at MAX_GROUP_CHILDREN and no nested groups)
export const canvasGroupObjectSchema = canvasObjectBaseSchema
  .extend({
    type: z.literal("group"),
    objects: z
      .array(canvasGroupChildSchema)
      .max(MAX_GROUP_CHILDREN, `Group cannot exceed ${MAX_GROUP_CHILDREN} child objects`),
  })
  .strict();

// Union of all supported canvas objects (discriminated union by type for performance and security)
export const canvasObjectSchema = z.discriminatedUnion("type", [
  canvasTextObjectSchema.extend({ type: z.literal("i-text") }),
  canvasTextObjectSchema.extend({ type: z.literal("text") }),
  canvasTextObjectSchema.extend({ type: z.literal("textbox") }),
  canvasImageObjectSchema,
  canvasShapeObjectSchema.extend({ type: z.literal("rect") }),
  canvasShapeObjectSchema.extend({ type: z.literal("circle") }),
  canvasShapeObjectSchema.extend({ type: z.literal("line") }),
  canvasPathObjectSchema,
  canvasGroupObjectSchema,
]);

// Canonical Canvas Document Schema
export const canvasDocumentSchema = z
  .object({
    version: z.literal("1.0.0").default("1.0.0"),
    dimensions: z
      .object({
        width: z
          .number()
          .int()
          .min(MIN_CANVAS_DIMENSION)
          .max(MAX_CANVAS_DIMENSION)
          .default(1080),
        height: z
          .number()
          .int()
          .min(MIN_CANVAS_DIMENSION)
          .max(MAX_CANVAS_DIMENSION)
          .default(1920),
        unit: z.literal("px").default("px"),
      })
      .strict(),
    backgroundColor: safeColorSchema.default("#ffffff"),
    backgroundImage: z
      .object({
        src: safeImageUrlSchema,
        opacity: z.number().min(0).max(1).default(1),
      })
      .strict()
      .optional(),
    fontsUsed: z.array(z.string().max(64)).max(20).default([]),
    objects: z
      .array(canvasObjectSchema)
      .max(MAX_CANVAS_OBJECTS, `Canvas cannot exceed ${MAX_CANVAS_OBJECTS} objects`)
      .default([]),
  })
  .strict();

export type CanvasDocumentInput = z.infer<typeof canvasDocumentSchema>;

// Card mutation schemas
export const createCardSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
    templateId: z.string().uuid().optional(),
    canvasJSON: canvasDocumentSchema,
    width: z.number().int().min(MIN_CANVAS_DIMENSION).max(MAX_CANVAS_DIMENSION).default(1080),
    height: z.number().int().min(MIN_CANVAS_DIMENSION).max(MAX_CANVAS_DIMENSION).default(1920),
    isPublic: z.boolean().default(false),
  })
  .strict();

export const updateCardSchema = createCardSchema.partial();
