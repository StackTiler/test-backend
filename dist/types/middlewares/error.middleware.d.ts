import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/error-handler.utills";
export declare const errorMiddleware: (err: ErrorHandler | Error, req: Request, res: Response, next: NextFunction) => void;
