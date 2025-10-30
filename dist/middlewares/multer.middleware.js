"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploader = void 0;
const multer_utility_1 = require("multer-utility");
exports.uploader = new multer_utility_1.UploadService({
    storage: 'disk',
    uploadDir: './uploads',
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 1024 * 1024 * 25,
    useTimestamp: true,
    sanitizeFilenames: true,
    customNaming: (file) => `custom-${Date.now()}-${file.originalname}`
});
