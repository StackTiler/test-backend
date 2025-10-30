import { UploadService } from "multer-utility";

export const uploader = new UploadService({
  storage: 'disk',
  uploadDir: './uploads',
  allowedMimeTypes: ['image/jpeg', 'image/jpg','image/png'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  maxFileSize: 1024 * 1024 * 25,
  useTimestamp: true,
  sanitizeFilenames: true,
  customNaming: (file) => `custom-${Date.now()}-${file.originalname}`
});