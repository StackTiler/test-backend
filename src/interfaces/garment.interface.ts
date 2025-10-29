import { Types } from "mongoose";

export type Availability = "in stock" | "out of stock" | "pre-order";
export interface Garment {       
  name: string;
  description: string;
  price: number;
  size: string;                 
  availability: Availability;
  vendor: string;
  categories: string;
  tags: string[];
  createdAt: Date;             
  updatedAt: Date;  
}