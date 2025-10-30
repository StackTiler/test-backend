import { z } from "zod";

const AVAILABILITY = ["in stock", "out of stock", "pre-order"] as const;

export const createGarmentSchema = z.object({
  body: z.object({
    garment: z.object({
      name: z.string().min(2).max(200).trim(),
      description: z.string().min(1).max(5000).trim(),
      price: z.number().positive().min(0),
      size: z.string().min(1).max(200).trim(),
      availability: z.enum(AVAILABILITY).default("in stock"),
      vendor: z.string().min(1).max(120).trim().toLowerCase(),
      categories: z.string().min(1).max(120).trim().toLowerCase(),
      tags: z.array(z.string()).default(["N/A"]),
    }),
  }),
});

export const updateGarmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
  body: z.object({
    garment: z.object({
      name: z.string().min(2).max(200).trim().optional(),
      description: z.string().min(1).max(5000).trim().optional(),
      price: z.number().positive().min(0).optional(),
      size: z.string().min(1).max(200).trim().optional(),
      availability: z.enum(AVAILABILITY).optional(),
      vendor: z.string().min(1).max(120).trim().toLowerCase().optional(),
      categories: z.string().min(1).max(120).trim().toLowerCase().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }),
});

export const deleteGarmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
});

export const getGarmentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
});

export const getAllGarmentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  }),
});

export const searchGarmentsSchema = z.object({
  query: z.object({
    name: z.string().min(1).trim(),
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  }),
});

export type CreateGarmentInput = z.infer<typeof createGarmentSchema>;
export type UpdateGarmentInput = z.infer<typeof updateGarmentSchema>;
export type DeleteGarmentInput = z.infer<typeof deleteGarmentSchema>;
export type GetGarmentByIdInput = z.infer<typeof getGarmentByIdSchema>;
export type GetAllGarmentsInput = z.infer<typeof getAllGarmentsSchema>;
export type SearchGarmentsInput = z.infer<typeof searchGarmentsSchema>;
