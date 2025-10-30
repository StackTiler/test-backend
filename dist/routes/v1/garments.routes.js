"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const garments_controller_1 = require("../../controller/garments.controller");
const context_binder_1 = require("../../helpers/context-binder");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const garments_schema_1 = require("../../schema/garments.schema");
const multer_middleware_1 = require("../../middlewares/multer.middleware");
class GarmentsRoutes {
    constructor() {
        this.garmentsController = new garments_controller_1.GarmentsController();
        context_binder_1.ThisContextBinder.bindControllerMethods(this.garmentsController);
    }
    garmentsRoutesInit(app) {
        const garmentsRoutes = express_1.default.Router();
        garmentsRoutes.post("/garments", multer_middleware_1.uploader.array("files", 4), 
        // validate(createGarmentSchema),
        this.garmentsController.addGarment);
        garmentsRoutes.patch("/garments/:id", multer_middleware_1.uploader.array("files", 4), (0, validation_middleware_1.validate)(garments_schema_1.updateGarmentSchema), this.garmentsController.updateGarment);
        garmentsRoutes.delete("/garments/:id", (0, validation_middleware_1.validate)(garments_schema_1.deleteGarmentSchema), this.garmentsController.deleteGarment);
        garmentsRoutes.get("/garments/:id", (0, validation_middleware_1.validate)(garments_schema_1.getGarmentByIdSchema), this.garmentsController.getGarmentById);
        garmentsRoutes.get("/garments/search/name", (0, validation_middleware_1.validate)(garments_schema_1.searchGarmentsSchema), this.garmentsController.searchGarmentsByName);
        garmentsRoutes.get("/garments", (0, validation_middleware_1.validate)(garments_schema_1.getAllGarmentsSchema), this.garmentsController.getAllGarments);
        app.use("/v1", garmentsRoutes);
    }
}
exports.default = GarmentsRoutes;
