import { z } from "zod";

// Whitelist of valid Fabric.js object types allowed in Utsob canvases
export const canvasObjectTypeSchema = z.enum([
  "i-text",
  "text",
  "textbox",
  "image",
  "rect",
  "circle",
  "path",
  "group",
  "line",
]);

// Base canvas object attributes
export const canvasObjectBaseSchema = z.object({
  id: z.string().optional(),
  left: z.number().default(0),
  top: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
  scaleX: z.number().default(1),
  scaleY: z.number().default(1),
  angle: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  originX: z.enum(["left", "center", "right"]).default("left"),
  originY: z.enum(["top", "center", "bottom"]).default("top"),
  selectable: z.boolean().default(true),
  locked: z.boolean().default(false),
  name: z.string().max(100).optional(),
});

// Text object attributes (Bengali typography)
export const canvasTextObjectSchema = canvasObjectBaseSchema.extend({
  type: z.enum(["i-text", "text", "textbox"]),
  text: z.string(),
  fontSize: z.number().min(8).max(256).default(32),
  fontFamily: z.string().default("Hind Siliguri"),
  fontWeight: z.union([z.string(), z.number()]).optional(),
  fontStyle: z.enum(["normal", "italic"]).default("normal"),
  fill: z.string().default("#000000"),
  textAlign: z.enum(["left", "center", "right", "justify"]).default("center"),
  lineHeight: z.number().default(1.2),
  charSpacing: z.number().default(0),
});

// Image object attributes with strict URL validation (preventing javascript: URIs)
export const canvasImageObjectSchema = canvasObjectBaseSchema.extend({
  type: z.literal("image"),
  src: z
    .string()
    .url("Invalid image URL")
    .refine((url) => !url.toLowerCase().startsWith("javascript:") && !url.toLowerCase().startsWith("data:text/html"), {
      message: "Executable javascript URIs are strictly forbidden",
    }),
  crossOrigin: z.string().optional(),
});

// Shape object attributes
export const canvasShapeObjectSchema = canvasObjectBaseSchema.extend({
  type: z.enum(["rect", "circle", "path", "line", "group"]),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
});

// Union of all supported canvas objects
export const canvasObjectSchema = z.union([
  canvasTextObjectSchema,
  canvasImageObjectSchema,
  canvasShapeObjectSchema,
]);

// Canonical Canvas Document Schema
export const canvasDocumentSchema = z.object({
  version: z.literal("1.0.0").default("1.0.0"),
  dimensions: z.object({
    width: z.number().int().min(100).max(4000).default(1080),
    height: z.number().int().min(100).max(4000).default(1920),
    unit: z.literal("px").default("px"),
  }),
  backgroundColor: z.string().default("#ffffff"),
  backgroundImage: z
    .object({
      src: z.string().url(),
      opacity: z.number().min(0).max(1).default(1),
    })
    .optional(),
  fontsUsed: z.array(z.string()).default([]),
  objects: z.array(canvasObjectSchema).default([]),
});

export type CanvasDocumentInput = z.infer<typeof canvasDocumentSchema>;

// Card mutation schemas
export const createCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
  templateId: z.string().uuid().optional(),
  canvasJSON: canvasDocumentSchema,
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  isPublic: z.boolean().default(false),
});

export const updateCardSchema = createCardSchema.partial();
