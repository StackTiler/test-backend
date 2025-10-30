import { Schema, Document } from "mongoose";
import { Garment } from "../interfaces/garment.interface";
export interface IGarmentSchema extends Garment, Document {
}
export declare const ProductSchema: Schema<IGarmentSchema, import("mongoose").Model<IGarmentSchema, any, any, any, Document<unknown, any, IGarmentSchema, any, {}> & IGarmentSchema & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IGarmentSchema, Document<unknown, {}, import("mongoose").FlatRecord<IGarmentSchema>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<IGarmentSchema> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const GarmentsModel: import("mongoose").Model<IGarmentSchema, {}, {}, {}, Document<unknown, {}, IGarmentSchema, {}, {}> & IGarmentSchema & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
