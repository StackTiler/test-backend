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
import { authMiddleware } from "../../middlewares/auth.middleware";

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
      authMiddleware,
      uploader.array("files", 4),
      // validate(createGarmentSchema),
      this.garmentsController.addGarment
    );

    garmentsRoutes.patch(
      "/garments/:id",
      authMiddleware,
      uploader.array("files", 4),
      // validate(updateGarmentSchema),
      this.garmentsController.updateGarment
    );

    garmentsRoutes.delete(
      "/garments/:id",
      authMiddleware,
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
      authMiddleware,
      validate(searchGarmentsSchema),
      this.garmentsController.searchGarmentsByName
    );

    garmentsRoutes.get(
      "/garments",
      authMiddleware,
      validate(getAllGarmentsSchema),
      this.garmentsController.getAllGarments
    );

    garmentsRoutes.get(
      "/garment/qr/:id",
      authMiddleware,
      this.garmentsController.generateProductQR
    )

    app.use("/v1", garmentsRoutes);
  }
}

export default GarmentsRoutes;
