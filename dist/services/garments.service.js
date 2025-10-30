"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarmentsService = void 0;
const response_messages_1 = require("response-messages");
const garments_repository_1 = require("../repositories/garments.repository");
const mongoose_1 = require("mongoose");
class GarmentsService {
    constructor() {
        this.garmentsRepository = new garments_repository_1.GarmentRepository();
    }
    async addGarments(garment) {
        const garmentAdded = await this.garmentsRepository.create(garment);
        if (!garmentAdded)
            return response_messages_1.ResponseMessage.internalServerError("Failed to add garment");
        return response_messages_1.ResponseMessage.created("Garment added successfully", {
            garment: garmentAdded,
        });
    }
    async updateGarment(id, garment) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return response_messages_1.ResponseMessage.badRequest("Invalid garment ID");
        }
        const updatedGarment = await this.garmentsRepository.updateById(id, garment);
        if (!updatedGarment) {
            return response_messages_1.ResponseMessage.notFound("Garment not found");
        }
        return response_messages_1.ResponseMessage.ok("Garment updated successfully", {
            garment: updatedGarment,
        });
    }
    async deleteGarment(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return response_messages_1.ResponseMessage.badRequest("Invalid garment ID");
        }
        const deletedGarment = await this.garmentsRepository.deleteById(id);
        if (!deletedGarment) {
            return response_messages_1.ResponseMessage.notFound("Garment not found");
        }
        return response_messages_1.ResponseMessage.ok("Garment deleted successfully", {
            garment: deletedGarment,
        });
    }
    async getGarmentById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return response_messages_1.ResponseMessage.badRequest("Invalid garment ID");
        }
        const garment = await this.garmentsRepository.findById(id);
        if (!garment) {
            return response_messages_1.ResponseMessage.notFound("Garment not found");
        }
        return response_messages_1.ResponseMessage.ok("Garment fetched successfully", {
            garment,
        });
    }
    async getAllGarments(page = 1, limit = 10) {
        if (page < 1 || limit < 1) {
            return response_messages_1.ResponseMessage.badRequest("Invalid pagination parameters");
        }
        const result = await this.garmentsRepository.findWithPagination({}, page, limit);
        return response_messages_1.ResponseMessage.ok("Garments fetched successfully", {
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
    async searchGarmentsByName(name, page = 1, limit = 10) {
        if (page < 1 || limit < 1) {
            return response_messages_1.ResponseMessage.badRequest("Invalid pagination parameters");
        }
        const result = await this.garmentsRepository.searchWithPagination("name", name, page, limit);
        return response_messages_1.ResponseMessage.ok("Search completed successfully", {
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
exports.GarmentsService = GarmentsService;
