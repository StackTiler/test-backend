import QRCode from 'qrcode';
import { promises as fs } from 'fs';
import path from 'path';

export class QRCodeService {
  private static readonly QR_DIR = path.join(__dirname, '../../generated-qr');
  private static readonly BASE_URL = process.env.FRONTEND_URL || 'http://192.168.29.78:5173';

  static async initQRDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.QR_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating QR directory:', error);
      throw error;
    }
  }

  static async generateQRCode(garmentId: string): Promise<string> {
    try {
      await this.initQRDirectory();

      const productUrl = `${this.BASE_URL}/kumud/admin/details?id=${garmentId}`;
      const qrFilePath = path.join(this.QR_DIR, `${garmentId}.png`);

      // Generate QR code with valid options only
      await QRCode.toFile(qrFilePath, productUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        scale: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrFilePath;
    } catch (error) {
      console.error(`Error generating QR code for ${garmentId}:`, error);
      throw new Error(`Failed to generate QR code for product ${garmentId}`);
    }
  }

  static async generateQRCodeBase64(garmentId: string): Promise<string> {
    try {
      const productUrl = `${this.BASE_URL}/kumud/admin/details?id=${garmentId}`;

      const qrCodeDataURL = await QRCode.toDataURL(productUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error(`Error generating base64 QR code for ${garmentId}:`, error);
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
          console.error(`Failed to generate QR for ${productId}:`, error);
        }
      })
    );

    return results;
  }
}