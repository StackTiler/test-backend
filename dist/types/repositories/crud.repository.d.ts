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
export declare class CrudRepository<T extends Document> {
    protected model: Model<T>;
    constructor(model: Model<T>);
    create(data: Partial<T>): Promise<T>;
    findById(id: string | Types.ObjectId): Promise<T | null>;
    findOne(filter?: Record<string, any>, options?: {
        sort?: Record<string, 1 | -1>;
    }): Promise<T | null>;
    findSelect(filter?: Record<string, any>, select?: string | string[]): Promise<any>;
    findAll(filter?: Record<string, any>): Promise<T[]>;
    findWithPagination(filter?: Record<string, any>, page?: number, limit?: number): Promise<PaginationResult<T>>;
    searchWithPagination(searchField: string, searchValue: string, page?: number, limit?: number): Promise<PaginationResult<T>>;
    updateById(id: string | Types.ObjectId, data: Partial<T>): Promise<T | null>;
    deleteOne(filter?: Record<string, any>): Promise<{
        deletedCount?: number;
    }>;
    deleteById(id: string | Types.ObjectId): Promise<T | null>;
    deleteMany(filter: Record<string, any>): Promise<DeleteResult>;
}
