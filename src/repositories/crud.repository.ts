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
    options?: { sort?: Record<string, 1 | -1> }
  ): Promise<T | null> {
    let query = this.model.findOne(filter);
    if (options?.sort) {
      query = query.sort(options.sort);
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
