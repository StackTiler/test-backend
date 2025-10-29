import { Model, Document, Types, DeleteResult } from "mongoose";

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

  async findOne(filter: Record<string, any> = {}, options?: { sort?: Record<string, 1 | -1> }): Promise<T | null> {
    let query = this.model.findOne(filter);
    if (options?.sort) {
      query = query.sort(options.sort);
    }

    return await query.exec();
  }

  async findSelect(filter: Record<string, any> = {}, select?: string | string[]): Promise<any> {
    let query = this.model.find(filter).lean();
    if (select) {
      query = query.select(select);
    }

    return await query.exec();
  }

  async findAll(filter: Record<string, any> = {}): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async updateById( id: string | Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteOne(filter: Record<string, any> = {}): Promise<{ deletedCount?: number }> {
    return await this.model.deleteOne(filter).exec();
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteMany (filter: Record<string, any>): Promise<DeleteResult>  {
    return await this.model.deleteMany(filter).exec()
  }
}