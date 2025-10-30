"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchGarmentsSchema = exports.getAllGarmentsSchema = exports.getGarmentByIdSchema = exports.deleteGarmentSchema = exports.updateGarmentSchema = exports.createGarmentSchema = void 0;
const zod_1 = require("zod");
const AVAILABILITY = ["in stock", "out of stock", "pre-order"];
exports.createGarmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(200).trim(),
        description: zod_1.z.string().min(1).max(5000).trim(),
        price: zod_1.z.number().positive().min(0),
        size: zod_1.z.string().min(1).max(200).trim(),
        availability: zod_1.z.enum(AVAILABILITY).default("in stock"),
        vendor: zod_1.z.string().min(1).max(120).trim().toLowerCase(),
        categories: zod_1.z.string().min(1).max(120).trim().toLowerCase(),
        tags: zod_1.z.array(zod_1.z.string()).default(["N/A"]),
    }),
    files: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.updateGarmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(200).trim().optional(),
        description: zod_1.z.string().min(1).max(5000).trim().optional(),
        price: zod_1.z.number().positive().min(0).optional(),
        size: zod_1.z.string().min(1).max(200).trim().optional(),
        availability: zod_1.z.enum(AVAILABILITY).optional(),
        vendor: zod_1.z.string().min(1).max(120).trim().toLowerCase().optional(),
        categories: zod_1.z.string().min(1).max(120).trim().toLowerCase().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    files: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.deleteGarmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    }),
});
exports.getGarmentByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    }),
});
exports.getAllGarmentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(10),
    }),
});
exports.searchGarmentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        name: zod_1.z.string().min(1).trim(),
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(10),
    }),
});
