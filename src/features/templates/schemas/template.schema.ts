import { z } from "zod";
import { canvasDocumentSchema } from "@/features/cards/schemas/card.schema";

export const templateFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  isPremium: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createTemplateSchema = z.object({
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  titleEn: z.string().min(1).max(150),
  titleBn: z.string().min(1).max(150),
  descriptionEn: z.string().max(1000).optional(),
  descriptionBn: z.string().max(1000).optional(),
  thumbnailUrl: z.string().url(),
  canvasJSON: canvasDocumentSchema,
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  isPremium: z.boolean().default(false),
  priceBdt: z.number().min(0).optional(),
  categoryId: z.string().uuid(),
});

