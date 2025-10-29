import { NextFunction, Request, Response } from "express";
import { GarmentsService } from "../services/garments.service";
import { Garment } from "../interfaces/garment.interface";
import { ErrorHandler } from "../utils/error-handler.utills";

export class GarmentsController {
    private garmentsService: GarmentsService;
    
    constructor(){
        this.garmentsService = new GarmentsService();
    }
    
    public async addGarment(
        req: Request<{},{},{ garment: Garment }>, 
        res:Response, 
        next: NextFunction
        ){
            try {
                if(!req.body.garment) return next(new ErrorHandler("empty fields not allowed", 400));

                const response =  await this.garmentsService.addGarments(req.body.garment);
                if(!response.success) return next(new ErrorHandler(response.message, response.statusCode));

                res.status(response.statusCode).json(response);

            } catch (error) {
                console.error("there is an issue in controller add garment fucntion line no:11", error);
                return res.status(500).json({success: false})
            }
    }
}