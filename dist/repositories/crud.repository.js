"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudRepository = void 0;
class CrudRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const doc = new this.model(data);
        return await doc.save();
    }
    async findById(id) {
        return await this.model.findById(id).exec();
    }
    async findOne(filter = {}, options) {
        let query = this.model.findOne(filter);
        if (options?.sort) {
            query = query.sort(options.sort);
        }
        return await query.exec();
    }
    async findSelect(filter = {}, select) {
        let query = this.model.find(filter).lean();
        if (select) {
            query = query.select(select);
        }
        return await query.exec();
    }
    async findAll(filter = {}) {
        return await this.model.find(filter).exec();
    }
    async findWithPagination(filter = {}, page = 1, limit = 10) {
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
    async searchWithPagination(searchField, searchValue, page = 1, limit = 10) {
        const filter = {
            [searchField]: { $regex: searchValue, $options: "i" },
        };
        return this.findWithPagination(filter, page, limit);
    }
    async updateById(id, data) {
        return await this.model
            .findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .exec();
    }
    async deleteOne(filter = {}) {
        return await this.model.deleteOne(filter).exec();
    }
    async deleteById(id) {
        return await this.model.findByIdAndDelete(id).exec();
    }
    async deleteMany(filter) {
        return await this.model.deleteMany(filter).exec();
    }
}
exports.CrudRepository = CrudRepository;
