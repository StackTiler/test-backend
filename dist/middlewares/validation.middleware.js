"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const error_handler_utills_1 = require("../utils/error-handler.utills");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));
                return next(new error_handler_utills_1.ErrorHandler(JSON.stringify({
                    message: "Validation failed",
                    errors: errorMessages
                }), 400));
            }
            next(error);
        }
    };
};
exports.validate = validate;
