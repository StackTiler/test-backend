import { Application } from "express";
declare class GarmentsRoutes {
    private garmentsController;
    constructor();
    garmentsRoutesInit(app: Application): void;
}
export default GarmentsRoutes;
