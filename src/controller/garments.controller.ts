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
      console.log({garmentData})

      const response = await this.garmentsService.addGarments(garmentData);
      
      if (!response.success) {
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error in addGarment controller:", error);
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
    const existingImagesParsed = existingImages ? JSON.parse(existingImages) : [];

    const allImages = [...existingImagesParsed, ...newFilePaths];
    const garmentData = { ...body, images: allImages };

    const response = await this.garmentsService.updateGarment(id, garmentData);

    if (!response.success) {
      return next(new ErrorHandler(response.message, response.statusCode));
    }

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error in updateGarment controller:", error);
    return next(new ErrorHandler("Failed to update garment", 500));
  }
};

  public async deleteGarment(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.garmentsService.deleteGarment(req.params.id);
      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error in deleteGarment controller:", error);
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
      console.error("Error in getGarmentById controller:", error);
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
      console.error("Error in getAllGarments controller:", error);
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
      console.error("Error in searchGarmentsByName controller:", error);
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
      if(!id) return next(new ErrorHandler("id is missing", 404));

      const response = await this.garmentsService.genrateQrCodeSerivce(new Types.ObjectId(id));
      if(!response.success) return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response)
    } catch (error) {
      next(error);
    }
  }
}
