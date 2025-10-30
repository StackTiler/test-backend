"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarmentRepository = void 0;
const garments_model_1 = require("../model/garments.model");
const crud_repository_1 = require("./crud.repository");
class GarmentRepository extends crud_repository_1.CrudRepository {
    constructor() {
        super(garments_model_1.GarmentsModel);
    }
}
exports.GarmentRepository = GarmentRepository;
