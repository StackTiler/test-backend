import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ErrorHandler } from "../utils/error-handler.utills";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = (error as any).errors.map((err:any) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        
        return next(
          new ErrorHandler(
            JSON.stringify({ 
              message: "Validation failed", 
              errors: errorMessages 
            }), 
            400
          )
        );
      }
      next(error);
    }
  };
};
