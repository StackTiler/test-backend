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
import { uploader } from "../../middlewares/multer.middleware";

class GarmentsRoutes {
  private garmentsController: GarmentsController;

  constructor() {
    this.garmentsController = new GarmentsController();
    ThisContextBinder.bindControllerMethods(this.garmentsController);
  }

  public garmentsRoutesInit(app: Application) {
    const garmentsRoutes: Router = express.Router();

    garmentsRoutes.post(
      "/garments",
      uploader.array("files", 4),
      // validate(createGarmentSchema),
      this.garmentsController.addGarment
    );

    garmentsRoutes.patch(
      "/garments/:id",
      uploader.array("files", 4),
      validate(updateGarmentSchema),
      this.garmentsController.updateGarment
    );

    garmentsRoutes.delete(
      "/garments/:id",
      validate(deleteGarmentSchema),
      this.garmentsController.deleteGarment
    );

    garmentsRoutes.get(
      "/garments/:id",
      validate(getGarmentByIdSchema),
      this.garmentsController.getGarmentById
    );

    garmentsRoutes.get(
      "/garments/search/name",
      validate(searchGarmentsSchema),
      this.garmentsController.searchGarmentsByName
    );

    garmentsRoutes.get(
      "/garments",
      validate(getAllGarmentsSchema),
      this.garmentsController.getAllGarments
    );


    app.use("/v1", garmentsRoutes);
  }
}

export default GarmentsRoutes;
