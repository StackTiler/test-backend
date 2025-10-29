import { ResponseMessage } from "response-messages";
import { Garment } from "../interfaces/garment.interface";
import { GarmentRepository } from "../repositories/garments.repository";
import { Types } from "mongoose";

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
    
    const updatedGarment = await this.garmentsRepository.updateById(
      id,
      garment
    );
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

  public async getGarmentById(id: string) {
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
}
