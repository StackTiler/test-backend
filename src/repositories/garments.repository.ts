import { GarmentsModel, IGarmentSchema } from "../model/garments.model";
import { CrudRepository } from "./crud.repository";

export class GarmentRepository extends CrudRepository<IGarmentSchema> {
    constructor(){
        super(GarmentsModel)
    }
}