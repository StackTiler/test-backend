/**
 * ============================================================================
 * Garments Business Logic Service
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Core business logic for garment operations.
 * Orchestrates repository access and business rule enforcement.
 *
 * COMPLETE GARMENT LIFECYCLE:
 *
 * 1. ADD GARMENT:
 *    - Receive garment data + file paths from controller
 *    - Call repository.create()
 *    - Return success with saved garment
 *
 * 2. UPDATE GARMENT:
 *    - Validate ID format (MongoDB ObjectId)
 *    - Merge existing images with new images
 *    - Call repository.updateById()
 *    - Return updated garment or not found error
 *
 * 3. DELETE GARMENT:
 *    - Validate ID format
 *    - Call repository.deleteById()
 *    - Return success or not found error
 *
 * 4. GET GARMENT BY ID:
 *    - Validate ID format
 *    - Call repository.findById()
 *    - Return garment details
 *
 * 5. GET ALL GARMENTS (PAGINATED):
 *    - Validate pagination parameters
 *    - Call repository.findWithPagination()
 *    - Return garments + pagination metadata
 *
 * 6. SEARCH GARMENTS:
 *    - Validate pagination parameters
 *    - Call repository.searchWithPagination('name', searchTerm)
 *    - Return matching garments + search metadata
 *
 * 7. GENERATE QR CODE:
 *    - Find garment by ID
 *    - Call QRCodeService.generateQRCodeBase64()
 *    - Return Base64 encoded QR code
 *
 * ERROR HANDLING:
 * - All operations validated before database access
 * - Graceful error messages returned via ResponseMessage
 * - HTTP status codes reflect operation result
 *
 * ============================================================================
 */

import { ResponseMessage } from "response-messages";
import { Garment } from "../interfaces/garment.interface";
import { GarmentRepository } from "../repositories/garments.repository";
import { Types } from "mongoose";
import { QRCodeService } from "./qr.service";

export class GarmentsService {
  private garmentsRepository: GarmentRepository;

  constructor() {
    this.garmentsRepository = new GarmentRepository();
  }

  public async addGarments(garment: Omit<Garment, "createdAt" | "updatedAt">) {
    const garmentAdded = await this.garmentsRepository.create(garment);

    if (!garmentAdded)
      return ResponseMessage.internalServerError("Failed to add garment");

    return ResponseMessage.created("Garment added successfully", {
      garment: garmentAdded,
    });
  }

  public async updateGarment(
    id: string,
    garment: Partial<Omit<Garment, "createdAt" | "updatedAt">>
  ) {
    if (!Types.ObjectId.isValid(id)) {
      return ResponseMessage.badRequest("Invalid garment ID");
    }

    const updatedGarment = await this.garmentsRepository.updateById(id, garment);

    if (!updatedGarment) {
      return ResponseMessage.notFound("Garment not found");
    }

    return ResponseMessage.ok("Garment updated successfully", {
      garment: updatedGarment,
    });
  }

  public async deleteGarment(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return ResponseMessage.badRequest("Invalid garment ID");
    }

    const deletedGarment = await this.garmentsRepository.deleteById(id);

    if (!deletedGarment) {
      return ResponseMessage.notFound("Garment not found");
    }

    return ResponseMessage.ok("Garment deleted successfully", {
      garment: deletedGarment,
    });
  }

  public async getGarmentById(id: Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) {
      return ResponseMessage.badRequest("Invalid garment ID");
    }

    const garment = await this.garmentsRepository.findById(id);

    if (!garment) {
      return ResponseMessage.notFound("Garment not found");
    }

    return ResponseMessage.ok("Garment fetched successfully", {
      garment,
    });
  }

  public async getAllGarments(page: number = 1, limit: number = 10) {
    if (page < 1 || limit < 1) {
      return ResponseMessage.badRequest("Invalid pagination parameters");
    }

    const result = await this.garmentsRepository.findWithPagination(
      {},
      page,
      limit
    );

    return ResponseMessage.ok("Garments fetched successfully", {
      garments: result.docs,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        nextPage: result.nextPage,
        prevPage: result.prevPage,
      },
    });
  }

  public async searchGarmentsByName(
    name: string,
    page: number = 1,
    limit: number = 10
  ) {
    if (page < 1 || limit < 1) {
      return ResponseMessage.badRequest("Invalid pagination parameters");
    }

    const result = await this.garmentsRepository.searchWithPagination(
      "name",
      name,
      page,
      limit
    );

    return ResponseMessage.ok("Search completed successfully", {
      garments: result.docs,
      searchTerm: name,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        nextPage: result.nextPage,
        prevPage: result.prevPage,
      },
    });
  }

  public async genrateQrCodeSerivce(garmentId: Types.ObjectId) {
    const garment = await this.garmentsRepository.findById(garmentId);

    if (!garment) return ResponseMessage.badRequest("Garment not found");

    const qrCodeBase64 =
      await QRCodeService.generateQRCodeBase64(garmentId.toString());

    if (!qrCodeBase64)
      return ResponseMessage.internalServerError(
        "Failed to generate QR code"
      );

    return ResponseMessage.created("QR code generated", { qrCodeBase64 });
  }
}
