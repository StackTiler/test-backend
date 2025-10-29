import { ResponseMessage } from "response-messages"
import { Garment } from "../interfaces/garment.interface";
import { GarmentRepository } from "../repositories/garments.repository";

export class GarmentsService {
    private garmentsRepository: GarmentRepository;
    
    constructor(){
        this.garmentsRepository= new GarmentRepository();    
    }

    public async addGarments(garment: Omit<Garment, "createdAt" | 'updatedAt'>){
        const garmentAdded =  await this.garmentsRepository.create(garment);
        if(!garmentAdded) return ResponseMessage.internalServerError("Failed to add data");

        return ResponseMessage.created("Garment added")
    }
}