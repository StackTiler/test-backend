import express, { Application, Router } from "express";
import { GarmentsController } from "../../controller/garments.controller";
import { ThisContextBinder } from "../../helpers/context-binder";
import { validate } from "../../middlewares/validation.middleware";
import {
  createGarmentSchema,
  updateGarmentSchema,
  deleteGarmentSchema,
  getGarmentByIdSchema,
  getAllGarmentsSchema,
  searchGarmentsSchema,
} from "../../schema/garments.schema";

class GarmentsRoutes {
  private garmentsController: GarmentsController;

  constructor() {
    this.garmentsController = new GarmentsController();
    ThisContextBinder.bindControllerMethods(this.garmentsController);
  }

  public garmentsRoutesInit(app: Application) {
    const garmentsRoutes: Router = express.Router();

    // Create garment
    garmentsRoutes.post(
      "/garments",
      validate(createGarmentSchema),
      this.garmentsController.addGarment
    );

    // Update garment
    garmentsRoutes.patch(
      "/garments/:id",
      validate(updateGarmentSchema),
      this.garmentsController.updateGarment
    );

    // Delete garment
    garmentsRoutes.delete(
      "/garments/:id",
      validate(deleteGarmentSchema),
      this.garmentsController.deleteGarment
    );

    // Get garment by ID
    garmentsRoutes.get(
      "/garments/:id",
      validate(getGarmentByIdSchema),
      this.garmentsController.getGarmentById
    );

    // Search garments by name with pagination
    garmentsRoutes.get(
      "/garments/search/name",
      validate(searchGarmentsSchema),
      this.garmentsController.searchGarmentsByName
    );

    // Get all garments with pagination
    garmentsRoutes.get(
      "/garments",
      validate(getAllGarmentsSchema),
      this.garmentsController.getAllGarments
    );


    app.use("/v1", garmentsRoutes);
  }
}

export default GarmentsRoutes;
