/**
 * ============================================================================
 * Generic CRUD Repository Base Class
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Provides reusable database operations for any MongoDB model.
 * Implements Repository pattern for clean data access abstraction.
 *
 * CORE OPERATIONS:
 *
 * 1. CREATE:
 *    - create(data) → Insert new document, return saved document
 *
 * 2. READ:
 *    - findById(id) → Get single document by ID
 *    - findOne(filter, options) → Get first matching document with sort/select
 *    - findAll(filter) → Get all matching documents
 *    - findSelect(filter, select) → Get documents with field selection (lean)
 *    - findWithPagination(filter, page, limit) → Paginated results with metadata
 *    - searchWithPagination(field, value, page, limit) → Text search with pagination
 *
 * 3. UPDATE:
 *    - updateById(id, data) → Update document, run validators, return updated
 *
 * 4. DELETE:
 *    - deleteById(id) → Delete single document by ID
 *    - deleteOne(filter) → Delete first matching document
 *    - deleteMany(filter) → Delete all matching documents
 *
 * PAGINATION RESULT:
 * Returns metadata for frontend pagination UI:
 * - docs: Array of documents
 * - totalDocs: Total document count
 * - totalPages: Calculated total pages
 * - currentPage: Current page number
 * - hasNextPage/hasPrevPage: Boolean flags
 * - nextPage/prevPage: Next/previous page numbers or null
 *
 * SEARCH IMPLEMENTATION:
 * Uses regex with 'i' flag for case-insensitive substring matching
 * Alternative: Use text indexes for full-text search performance
 *
 * ============================================================================
 */

import { Model, Document, Types, DeleteResult } from "mongoose";

export interface PaginationResult<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export class CrudRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return await doc.save();
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(
    filter: Record<string, any> = {},
    options?: { sort?: Record<string, any>; select: string }
  ): Promise<T | null> {
    let query = this.model.findOne(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.select) {
      query = query.select(options.select);
    }

    return await query.exec();
  }

  async findSelect(
    filter: Record<string, any> = {},
    select?: string | string[]
  ): Promise<any> {
    let query = this.model.find(filter).lean();

    if (select) {
      query = query.select(select);
    }

    return await query.exec();
  }

  async findAll(filter: Record<string, any> = {}): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async findWithPagination(
    filter: Record<string, any> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      docs,
      totalDocs,
      totalPages,
      currentPage: page,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    };
  }

  async searchWithPagination(
    searchField: string,
    searchValue: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResult<T>> {
    const filter = {
      [searchField]: { $regex: searchValue, $options: "i" },
    };

    return this.findWithPagination(filter, page, limit);
  }

  async updateById(
    id: string | Types.ObjectId,
    data: Partial<T>
  ): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  async deleteOne(
    filter: Record<string, any> = {}
  ): Promise<{ deletedCount?: number }> {
    return await this.model.deleteOne(filter).exec();
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteMany(filter: Record<string, any>): Promise<DeleteResult> {
    return await this.model.deleteMany(filter).exec();
  }
}
