/**
 * ============================================================================
 * Multer File Upload Middleware
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Configures file upload handling for garment image uploads.
 * Uses multer-utility for simplified file management.
 *
 * CONFIGURATION:
 * - storage: 'disk' → Save files to disk (not memory)
 * - uploadDir: './uploads' → Target directory for uploaded files
 * - allowedMimeTypes: Only image formats (JPEG, PNG, WebP)
 * - allowedExtensions: Strict file extension validation
 * - maxFileSize: 25MB per file (1024 * 1024 * 25 bytes)
 * - useTimestamp: Add timestamp to prevent filename collisions
 * - sanitizeFilenames: Remove special characters from filenames
 * - customNaming: Generate unique names with format: custom-{timestamp}-{originalname}
 *
 * USAGE IN ROUTES:
 * router.post('/garments', uploader.array('files', 4), controller.addGarment)
 * - 'files': Form field name for file uploads
 * - 4: Maximum files per request
 *
 * FILE PATH STORAGE:
 * After upload, file paths saved to database for later retrieval.
 * Paths served via static file endpoint: /v1/uploads/{filename}
 *
 * ============================================================================
 */

import { UploadService } from "multer-utility";

export const uploader = new UploadService({
  storage: "disk",
  uploadDir: "./uploads",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  maxFileSize: 1024 * 1024 * 25,
  useTimestamp: true,
  sanitizeFilenames: true,
  customNaming: (file) => `custom-${Date.now()}-${file.originalname}`,
});
