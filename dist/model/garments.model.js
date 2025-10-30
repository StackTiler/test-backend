"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarmentsModel = exports.ProductSchema = void 0;
const mongoose_1 = require("mongoose");
const AVAILABILITY = ["in stock", "out of stock", "pre-order"];
exports.ProductSchema = new mongoose_1.Schema({
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
            validator: (arr) => Array.isArray(arr) && arr.every((t) => typeof t === "string"),
            message: "All tags must be strings",
        },
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.every((t) => typeof t === "string"),
            message: "All tags must be strings",
        },
    },
}, {
    timestamps: true,
    strict: "throw",
    versionKey: false,
});
exports.ProductSchema.index({ name: "text", description: "text" });
exports.ProductSchema.index({ categories: 1, availability: 1 });
exports.ProductSchema.index({ price: 1 });
exports.GarmentsModel = (0, mongoose_1.model)("Garments", exports.ProductSchema);
