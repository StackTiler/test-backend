/**
 * ============================================================================
 * QR Code Generation Service
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Generates QR codes for products linking to product details page.
 * Supports both file-based and Base64 encoding for different use cases.
 *
 * FLOW:
 *
 * 1. INITIALIZE QR DIRECTORY:
 *    - Create ./generated-qr directory if not exists
 *    - Used for storing QR code PNG files
 *
 * 2. GENERATE QR CODE (File):
 *    - Takes garment ID as input
 *    - Creates product URL: {BASE_URL}/?id={garmentId}
 *    - Generates PNG file with high error correction
 *    - Saves to ./generated-qr/{garmentId}.png
 *    - Returns file path
 *
 * 3. GENERATE QR CODE BASE64:
 *    - Same as above but returns Base64 data URL
 *    - Use case: Send directly in API response
 *    - No file system I/O needed
 *    - Format: data:image/png;base64,iVBORw0KG...
 *
 * 4. BATCH QR GENERATION:
 *    - Generate multiple QR codes in parallel
 *    - Map product IDs to their QR file paths
 *    - Graceful error handling per product
 *
 * QR CODE SETTINGS:
 * - errorCorrectionLevel: 'H' (30% error recovery)
 * - margin: 1 (white space border)
 * - width: 300px (suitable for scanning)
 * - scale: 4 (pixel size per module)
 * - color: Black (#000000) on white (#FFFFFF)
 *
 * USE CASES:
 * 1. Print on packaging: File-based QR codes
 * 2. Email/Digital: Base64 QR codes in responses
 * 3. Bulk generation: Batch processing
 *
 * ============================================================================
 */

import QRCode from "qrcode";
import { promises as fs } from "fs";
import path from "path";
import ENV from "../config/env.config";

export class QRCodeService {
  private static readonly QR_DIR = path.join(
    __dirname,
    "../../generated-qr"
  );
  private static readonly BASE_URL =
    ENV.FRONTEND_URL || "http://192.168.29.78:5173";

  static async initQRDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.QR_DIR, { recursive: true });
    } catch (error) {
      throw error;
    }
  }

  static async generateQRCode(garmentId: string): Promise<string> {
    try {
      await this.initQRDirectory();

      const productUrl = `${this.BASE_URL}/?id=${garmentId}`;
      const qrFilePath = path.join(this.QR_DIR, `${garmentId}.png`);

      await QRCode.toFile(qrFilePath, productUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
        scale: 4,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrFilePath;
    } catch (error) {
      throw new Error(`Failed to generate QR code for product ${garmentId}`);
    }
  }

  static async generateQRCodeBase64(garmentId: string): Promise<string> {
    try {
      const productUrl = `${this.BASE_URL}/?id=${garmentId}`;

      const qrCodeDataURL = await QRCode.toDataURL(productUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR code for product ${garmentId}`);
    }
  }

  static async generateBatchQRCodes(
    productIds: string[]
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    await Promise.all(
      productIds.map(async (productId) => {
        try {
          const qrPath = await this.generateQRCode(productId);
          results.set(productId, qrPath);
        } catch (error) {
          // Graceful error handling - continue processing other products
        }
      })
    );

    return results;
  }
}
