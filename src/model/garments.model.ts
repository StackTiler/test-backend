/**
 * ============================================================================
 * Garment MongoDB Schema & Model
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Defines MongoDB schema for garment/product collection.
 * Implements validation, indexes, and type safety.
 *
 * SCHEMA STRUCTURE:
 * - name: Text field (2-200 chars), searchable
 * - description: Text field (max 5000 chars), searchable
 * - price: Number with min 0 validation
 * - size: String field (1-200 chars)
 * - availability: Enum (in stock, out of stock, pre-order), default in stock
 * - vendor: Lowercase string for consistent filtering
 * - categories: Lowercase string for categorization
 * - tags: Array of string tags for SEO
 * - images: Array of image file paths
 * - timestamps: Automatic createdAt/updatedAt tracking
 *
 * INDEXES:
 * - Text indexes on name + description for full-text search
 * - Compound index on categories + availability for filtered queries
 * - Index on price for price range queries
 *
 * VALIDATIONS:
 * - All strings trimmed and validated for format
 * - Arrays validated to ensure string elements only
 * - Price minimum enforced (no negative values)
 * - Size and name have length constraints
 *
 * ============================================================================
 */

import { Schema, model, Document } from "mongoose";
import { Garment } from "../interfaces/garment.interface";

const AVAILABILITY = ["in stock", "out of stock", "pre-order"] as const;

export interface IGarmentSchema extends Garment, Document { }

export const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    size: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    availability: {
      type: String,
      required: true,
      enum: AVAILABILITY,
      default: "in stock",
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    categories: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    styleCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "india",
      maxlength: 100,
    },
    collection_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: unknown[]) =>
          Array.isArray(arr) && arr.every((t) => typeof t === "string"),
        message: "All tags must be strings",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: unknown[]) =>
          Array.isArray(arr) && arr.every((t) => typeof t === "string"),
        message: "All images must be strings",
      },
    },
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  }
);

ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ categories: 1, availability: 1 });
ProductSchema.index({ price: 1 });

export const GarmentsModel = model<IGarmentSchema>("Garments", ProductSchema);
