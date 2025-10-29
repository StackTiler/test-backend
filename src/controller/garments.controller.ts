import { NextFunction, Request, Response } from "express";
import { GarmentsService } from "../services/garments.service";
import { Garment } from "../interfaces/garment.interface";
import { ErrorHandler } from "../utils/error-handler.utills";

export class GarmentsController {
  private garmentsService: GarmentsService;

  constructor() {
    this.garmentsService = new GarmentsService();
  }

  public async addGarment(
    req: Request<{}, {}, { garment: Garment }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.garmentsService.addGarments(
        req.body.garment
      );
      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error in addGarment controller:", error);
      return next(new ErrorHandler("Failed to add garment", 500));
    }
  }

  public async updateGarment(
    req: Request<{ id: string }, {}, { garment: Partial<Garment> }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.garmentsService.updateGarment(
        req.params.id,
        req.body.garment
      );
      if (!response.success)
        return next(new ErrorHandler(response.message, response.statusCode));

      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error in updateGarment controller:", error);
      return next(new ErrorHandler("Failed to update garment", 500));
    }
  }

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
        req.params.id
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
}
