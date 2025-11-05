/**
 * ============================================================================
 * Garment Validation Schemas (Zod)
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Defines runtime type validation schemas using Zod for all garment endpoints.
 * Handles both JSON and multipart/form-data validation.
 *
 * IMPORTANT: For file uploads (multipart), all form fields arrive as STRINGS
 * even if they were intended as numbers or booleans. Schemas must handle
 * type coercion from strings to actual types.
 *
 * VALIDATION RULES:
 * - JSON endpoints: Normal type validation
 * - Multipart endpoints: Use .transform() to convert strings to proper types
 * - Numbers: Parse string to number using parseFloat/parseInt
 * - Booleans: Check string values like "true"/"false"
 * - Arrays: Handle JSON-stringified arrays from form data
 *
 * ============================================================================
 */

import { z } from "zod";

const AVAILABILITY = ["in stock", "out of stock", "pre-order"] as const;

/**
 * Schema for creating garment via POST (multipart with files)
 * Handles string-to-type coercion for form data
 */
export const createGarmentSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(200).trim().optional(),
      description: z.string().min(1).max(5000).trim().optional(),
      price: z
        .string()
        .optional()
        .transform((val) => {
          if (!val) return undefined;
          const parsed = parseFloat(val);
          return isNaN(parsed) ? undefined : parsed;
        })
        .refine(
          (val) => val === undefined || val > 0,
          "Price must be a positive number"
        ),
      size: z.string().min(1).max(200).trim().optional(),
      availability: z.enum(AVAILABILITY).optional(),
      vendor: z.string().min(1).max(120).trim().toLowerCase().optional(),
      categories: z.string().min(1).max(120).trim().toLowerCase().optional(),
      tags: z
        .string()
        .optional()
        .transform((val) => {
          if (!val) return undefined;
          try {
            return JSON.parse(val);
          } catch {
            return [val];
          }
        }),
      existingImages: z.string().optional(),
    })
    .strict() // Reject unknown fields)
});

/**
 * Schema for updating garment via PATCH (multipart with files)
 * All fields optional - this is a partial update endpoint
 * IMPORTANT: body itself is NOT optional, but all properties inside are
 */
export const updateGarmentSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
  body: z
    .object({
      name: z.string().min(2).max(200).trim().optional(),
      description: z.string().min(1).max(5000).trim().optional(),
      price: z
        .string()
        .optional()
        .transform((val) => {
          if (!val) return undefined;
          const parsed = parseFloat(val);
          return isNaN(parsed) ? undefined : parsed;
        })
        .refine(
          (val) => val === undefined || val > 0,
          "Price must be a positive number"
        ),
      size: z.string().min(1).max(200).trim().optional(),
      availability: z.enum(AVAILABILITY).optional(),
      vendor: z.string().min(1).max(120).trim().toLowerCase().optional(),
      categories: z.string().min(1).max(120).trim().toLowerCase().optional(),
      tags: z
        .string()
        .optional()
        .transform((val) => {
          if (!val) return undefined;
          try {
            return JSON.parse(val);
          } catch {
            return [val];
          }
        }),
      existingImages: z.string().optional(),
    })
    .strict() // Reject unknown fields
    .partial(), // Make entire body optional (all fields become optional)
});


export const deleteGarmentSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
});

export const getGarmentByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
});

export const getAllGarmentsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .default(1),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .default(10),
  }),
});

export const searchGarmentsSchema = z.object({
  query: z.object({
    name: z.string().min(1).trim(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .default(1),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .default(10),
  }),
});

export type CreateGarmentInput = z.infer<typeof createGarmentSchema>;
export type UpdateGarmentInput = z.infer<typeof updateGarmentSchema>;
export type DeleteGarmentInput = z.infer<typeof deleteGarmentSchema>;
export type GetGarmentByIdInput = z.infer<typeof getGarmentByIdSchema>;
export type GetAllGarmentsInput = z.infer<typeof getAllGarmentsSchema>;
export type SearchGarmentsInput = z.infer<typeof searchGarmentsSchema>;
