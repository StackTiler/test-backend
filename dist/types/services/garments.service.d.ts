import { Garment } from "../interfaces/garment.interface";
export declare class GarmentsService {
    private garmentsRepository;
    constructor();
    addGarments(garment: Omit<Garment, "createdAt" | "updatedAt">): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
        data: any;
    }>;
    updateGarment(id: string, garment: Partial<Omit<Garment, "createdAt" | "updatedAt">>): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
        data: any;
    }>;
    deleteGarment(id: string): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
        data: any;
    }>;
    getGarmentById(id: string): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
        data: any;
    }>;
    getAllGarments(page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
        data: any;
    }>;
    searchGarmentsByName(name: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
        data: any;
    }>;
}
