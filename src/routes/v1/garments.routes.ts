import express, { Application, Router } from "express"
import { GarmentsController } from "../../controller/garments.controller";
import { ThisContextBinder } from "../../helpers/context-binder";

class GarmentsRoutes {
    private garmentsController: GarmentsController;
    
    constructor() {
        this.garmentsController= new GarmentsController();

        ThisContextBinder.bindControllerMethods(this.garmentsController);
    };

    public garmentsRoutesInit(app: Application){
        const garmentsRoutes: Router= express.Router();

        garmentsRoutes.post("/garments/add", this.garmentsController.addGarment)
    
        app.use("/v1", garmentsRoutes)
    }
}

export default GarmentsRoutes