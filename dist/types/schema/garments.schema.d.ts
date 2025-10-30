import { z } from "zod";
export declare const createGarmentSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        price: z.ZodNumber;
        size: z.ZodString;
        availability: z.ZodDefault<z.ZodEnum<{
            "in stock": "in stock";
            "out of stock": "out of stock";
            "pre-order": "pre-order";
        }>>;
        vendor: z.ZodString;
        categories: z.ZodString;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    files: z.ZodOptional<z.ZodArray<z.ZodAny>>;
}, z.core.$strip>;
export declare const updateGarmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
        size: z.ZodOptional<z.ZodString>;
        availability: z.ZodOptional<z.ZodEnum<{
            "in stock": "in stock";
            "out of stock": "out of stock";
            "pre-order": "pre-order";
        }>>;
        vendor: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    files: z.ZodOptional<z.ZodArray<z.ZodAny>>;
}, z.core.$strip>;
export declare const deleteGarmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getGarmentByIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getAllGarmentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
        limit: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const searchGarmentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        name: z.ZodString;
        page: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
        limit: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateGarmentInput = z.infer<typeof createGarmentSchema>;
export type UpdateGarmentInput = z.infer<typeof updateGarmentSchema>;
export type DeleteGarmentInput = z.infer<typeof deleteGarmentSchema>;
export type GetGarmentByIdInput = z.infer<typeof getGarmentByIdSchema>;
export type GetAllGarmentsInput = z.infer<typeof getAllGarmentsSchema>;
export type SearchGarmentsInput = z.infer<typeof searchGarmentsSchema>;
