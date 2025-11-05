/**
 * ============================================================================
 * Garments Repository
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Extends generic CRUD repository for garment-specific operations.
 * Provides domain-specific database access patterns.
 *
 * EXTENDS:
 * All methods from CrudRepository<IGarmentSchema> including:
 * - create, findById, findAll, findWithPagination
 * - updateById, deleteById, searchWithPagination
 *
 * FUTURE ENHANCEMENTS:
 * Can add garment-specific methods such as:
 * - findByVendor(vendor: string)
 * - findByCategory(category: string)
 * - findByPriceRange(minPrice: number, maxPrice: number)
 * - findAvailableGarments()
 *
 * ============================================================================
 */

import { GarmentsModel, IGarmentSchema } from "../model/garments.model";
import { CrudRepository } from "./crud.repository";

export class GarmentRepository extends CrudRepository<IGarmentSchema> {
  constructor() {
    super(GarmentsModel);
  }
}
