/**
 * ============================================================================
 * Garments HTTP Controller
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Handles HTTP requests for garment CRUD operations.
 * Processes file uploads, validates input, orchestrates service calls.
 *
 * REQUEST/RESPONSE FLOW:
 *
 * 1. POST /v1/garments (Add Garment):
 *    - Requires: authMiddleware (user must be logged in)
 *    - Input: Multipart form with files + JSON fields
 *    - Process: Extract uploaded file paths, build garment object
 *    - Service: Call addGarments()
 *    - Response: 201 + garment details
 *
 * 2. PATCH /v1/garments/:id (Update Garment):
 *    - Requires: authMiddleware
 *    - Input: Updated fields + new/existing images
 *    - Process: Merge existing images with new ones (preserve existing)
 *    - Service: Call updateGarment()
 *    - Response: 200 + updated garment
 *
 * 3. DELETE /v1/garments/:id (Delete Garment):
 *    - Requires: authMiddleware + validation
 *    - Input: ID parameter
 *    - Service: Call deleteGarment()
 *    - Response: 200 + deleted garment
 *
 * 4. GET /v1/garments/:id (Get Single):
 *    - Input: ID parameter
 *    - Service: Call getGarmentById()
 *    - Response: 200 + garment details
 *
 * 5. GET /v1/garments (Get All - Paginated):
 *    - Requires: authMiddleware + validation
 *    - Query params: page, limit
 *    - Service: Call getAllGarments()
 *    - Response: 200 + garments array + pagination
 *
 * 6. GET /v1/garments/search/name (Search):
 *    - Requires: authMiddleware + validation
 *    - Query params: name, page, limit
 *    - Service: Call searchGarmentsByName()
 *    - Response: 200 + matching garments + search metadata
 *
 * 7. GET /v1/garment/qr/:id (Generate QR):
 *    - Requires: authMiddleware
 *    - Input: ID parameter
 *    - Service: Call genrateQrCodeSerivce()
 *    - Response: 201 + Base64 QR code
 *
 * FILE HANDLING:
 * - Multer middleware processes file uploads
 * - Extracts file paths from Express.Multer.File[] array
 * - Files already saved to disk by multer middleware
 * - Controller only captures path references
 *
 * ERROR HANDLING:
 * - All errors caught and passed to error middleware
 * - Service layer returns error details
 * - Controller converts to HTTP status codes
 *
 * ============================================================================
 */

import { NextFunction, Request, Response } from "express";
import { GarmentsService } from "../services/garments.service";
import { ErrorHandler } from "../utils/error-handler.utills";
import { Types } from "mongoose";

export class GarmentsController {
  private garmentsService: GarmentsService;

  constructor() {
    this.garmentsService = new GarmentsService();
  }

  public addGarment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const filePaths = files.map((file) => file.path);

      const garmentData = {
        ...req.body,
        images: filePaths,
      };

      const response = await this.garmentsService.addGarments(garmentData);

      if (!response.success) {
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      res.status(response.statusCode).json(response);
    } catch (error) {
      return next(new ErrorHandler("Failed to add garment", 500));
    }
  };

  public updateGarment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const files = (req.files as Express.Multer.File[]) || [];
      const newFilePaths = files.map((file) => file.path);

      const { existingImages, ...body } = req.body;
      const existingImagesParsed = existingImages
        ? JSON.parse(existingImages)
        : [];
      const allImages = [...existingImagesParsed, ...newFilePaths];

      const garmentData = { ...body, images: allImages };

      const response = await this.garmentsService.updateGarment(
        id,
        garmentData
      );

      if (!response.success) {
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      res.status(response.statusCode).json(response);
    } catch (error) {
      return next(new ErrorHandler("Failed to update garment", 500));
    }
  };

  public async deleteGarment(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.garmentsService.deleteGarment(
        req.params.id
      );

      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      return next(new ErrorHandler("Failed to delete garment", 500));
    }
  }

  public async getGarmentById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.garmentsService.getGarmentById(
        new Types.ObjectId(req.params.id)
      );

      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      return next(new ErrorHandler("Failed to fetch garment", 500));
    }
  }

  public async getAllGarments(
    req: Request<{}, {}, {}, { page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page || "1");
      const limit = parseInt(req.query.limit || "10");

      const response = await this.garmentsService.getAllGarments(page, limit);

      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      return next(new ErrorHandler("Failed to fetch garments", 500));
    }
  }

  public async searchGarmentsByName(
    req: Request<{}, {}, {}, { name?: string; page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name } = req.query;
      const page = parseInt(req.query.page || "1");
      const limit = parseInt(req.query.limit || "10");

      const response = await this.garmentsService.searchGarmentsByName(
        name!,
        page,
        limit
      );

      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      return next(new ErrorHandler("Failed to search garments", 500));
    }
  }

  async generateProductQR(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) return next(new ErrorHandler("ID is missing", 404));

      const response = await this.garmentsService.genrateQrCodeSerivce(
        new Types.ObjectId(id)
      );

      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}
