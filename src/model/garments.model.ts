import { Schema, model, Document } from "mongoose";
import { Garment } from "../interfaces/garment.interface";

const AVAILABILITY = ["in stock", "out of stock", "pre-order"] as const;

export interface IGarmentSchema extends Garment, Document {}
export const ProductSchema = new Schema<IGarmentSchema>(
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
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.every((t) => typeof t === "string"),
        message: "All tags must be strings",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.every((t) => typeof t === "string"),
        message: "All tags must be strings",
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
