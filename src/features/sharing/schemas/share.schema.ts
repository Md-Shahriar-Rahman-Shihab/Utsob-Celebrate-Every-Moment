import { z } from "zod";

export const createShareLinkSchema = z.object({
  cardId: z.string().uuid("Invalid card ID"),
  accessType: z.enum(["VIEW_ONLY", "CAN_DUPLICATE"]).default("VIEW_ONLY"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(32, "Password cannot exceed 32 characters")
    .optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export const verifySharePasswordSchema = z.object({
  shareToken: z.string().min(1, "Share token is required"),
  password: z.string().min(1, "Password is required"),
});
