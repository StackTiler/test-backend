import { UploadService } from "multer-utility";

export const uploader = new UploadService({
  storage: 'disk',
  uploadDir: './uploads',
  allowedMimeTypes: ['image/jpeg', 'image/jpg','image/png', "image/webp"],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxFileSize: 1024 * 1024 * 25,
  useTimestamp: true,
  sanitizeFilenames: true,
  customNaming: (file) => `custom-${Date.now()}-${file.originalname}`
});