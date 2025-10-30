import { NextFunction, Request, Response } from "express";
import { Garment } from "../interfaces/garment.interface";
export declare class GarmentsController {
    private garmentsService;
    constructor();
    addGarment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateGarment: (req: Request<{
        id: string;
    }, {}, Partial<Garment>>, res: Response, next: NextFunction) => Promise<void>;
    deleteGarment(req: Request<{
        id: string;
    }>, res: Response, next: NextFunction): Promise<void>;
    getGarmentById(req: Request<{
        id: string;
    }>, res: Response, next: NextFunction): Promise<void>;
    getAllGarments(req: Request<{}, {}, {}, {
        page?: string;
        limit?: string;
    }>, res: Response, next: NextFunction): Promise<void>;
    searchGarmentsByName(req: Request<{}, {}, {}, {
        name?: string;
        page?: string;
        limit?: string;
    }>, res: Response, next: NextFunction): Promise<void>;
}
