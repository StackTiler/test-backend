"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarmentsController = void 0;
const garments_service_1 = require("../services/garments.service");
const error_handler_utills_1 = require("../utils/error-handler.utills");
class GarmentsController {
    constructor() {
        this.addGarment = async (req, res, next) => {
            try {
                const files = req.files || [];
                const filePaths = files.map((file) => file.path);
                const garmentData = {
                    ...req.body,
                    images: filePaths,
                };
                console.log({ garmentData });
                const response = await this.garmentsService.addGarments(garmentData);
                if (!response.success) {
                    return next(new error_handler_utills_1.ErrorHandler(response.message, response.statusCode));
                }
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                console.error("Error in addGarment controller:", error);
                return next(new error_handler_utills_1.ErrorHandler("Failed to add garment", 500));
            }
        };
        this.updateGarment = async (req, res, next) => {
            try {
                const { id } = req.params;
                const files = req.files || [];
                const filePaths = files.map((file) => file.path);
                const garmentData = {
                    ...req.body,
                    ...(filePaths.length > 0 && { images: filePaths }),
                };
                const response = await this.garmentsService.updateGarment(id, garmentData);
                if (!response.success) {
                    return next(new error_handler_utills_1.ErrorHandler(response.message, response.statusCode));
                }
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                console.error("Error in updateGarment controller:", error);
                return next(new error_handler_utills_1.ErrorHandler("Failed to update garment", 500));
            }
        };
        this.garmentsService = new garments_service_1.GarmentsService();
    }
    async deleteGarment(req, res, next) {
        try {
            const response = await this.garmentsService.deleteGarment(req.params.id);
            if (!response.success)
                return next(new error_handler_utills_1.ErrorHandler(response.message, response.statusCode));
            res.status(response.statusCode).json(response);
        }
        catch (error) {
            console.error("Error in deleteGarment controller:", error);
            return next(new error_handler_utills_1.ErrorHandler("Failed to delete garment", 500));
        }
    }
    async getGarmentById(req, res, next) {
        try {
            const response = await this.garmentsService.getGarmentById(req.params.id);
            if (!response.success)
                return next(new error_handler_utills_1.ErrorHandler(response.message, response.statusCode));
            res.status(response.statusCode).json(response);
        }
        catch (error) {
            console.error("Error in getGarmentById controller:", error);
            return next(new error_handler_utills_1.ErrorHandler("Failed to fetch garment", 500));
        }
    }
    async getAllGarments(req, res, next) {
        try {
            const page = parseInt(req.query.page || "1");
            const limit = parseInt(req.query.limit || "10");
            const response = await this.garmentsService.getAllGarments(page, limit);
            if (!response.success)
                return next(new error_handler_utills_1.ErrorHandler(response.message, response.statusCode));
            res.status(response.statusCode).json(response);
        }
        catch (error) {
            console.error("Error in getAllGarments controller:", error);
            return next(new error_handler_utills_1.ErrorHandler("Failed to fetch garments", 500));
        }
    }
    async searchGarmentsByName(req, res, next) {
        try {
            const { name } = req.query;
            const page = parseInt(req.query.page || "1");
            const limit = parseInt(req.query.limit || "10");
            const response = await this.garmentsService.searchGarmentsByName(name, page, limit);
            if (!response.success)
                return next(new error_handler_utills_1.ErrorHandler(response.message, response.statusCode));
            res.status(response.statusCode).json(response);
        }
        catch (error) {
            console.error("Error in searchGarmentsByName controller:", error);
            return next(new error_handler_utills_1.ErrorHandler("Failed to search garments", 500));
        }
    }
}
exports.GarmentsController = GarmentsController;
